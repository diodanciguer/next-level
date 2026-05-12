import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auth'
import { applyXpGain, applyXpLoss, getXpBonus, checkAndUnlockAchievements } from '@/lib/game'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const { id: habitId } = await params
    const habit = await prisma.habit.findUnique({ where: { id: habitId } })
    if (!habit || habit.userId !== String(user.id)) {
      return NextResponse.json({ message: 'Hábito não encontrado' }, { status: 404 })
    }

    const today = new Date(); today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)

    const existingCheckin = await prisma.habitCheckin.findFirst({
      where: { habitId, date: { gte: today, lt: tomorrow } }
    })
    if (existingCheckin) return NextResponse.json({ message: 'Check-in já realizado hoje' }, { status: 400 })

    const dbUser = await prisma.user.findUnique({ where: { id: String(user.id) } })
    if (!dbUser) return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 })

    // ─── Lógica de Bônus de Classe ───────────────────
    const bonusXp = getXpBonus(dbUser.characterClass, habit.category, habit.xpReward)
    const totalXpGain = habit.xpReward + bonusXp

    // ─── Lógica de Streak ───────────────────────────
    let newStreak = dbUser.streak
    const now = new Date()
    const last = dbUser.lastCheckin ? new Date(dbUser.lastCheckin) : null
    
    if (!last) {
      newStreak = 1
    } else {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); yesterday.setHours(0,0,0,0)
      const lastDate = new Date(last); lastDate.setHours(0,0,0,0)
      
      if (lastDate.getTime() === yesterday.getTime()) {
        newStreak += 1 // Consecutivo
      } else if (lastDate.getTime() < yesterday.getTime()) {
        newStreak = 1 // Quebrou a streak
      }
      // Se lastDate === today, a streak não muda (mas o checkin já foi bloqueado acima)
    }

    // ─── Lógica de Meta Mensal ───────────────────────
    const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0)
    const monthCheckinsCount = await prisma.habitCheckin.count({
      where: { habitId, date: { gte: startOfMonth } }
    })

    const goalReached = monthCheckinsCount + 1 === habit.goal
    let finalXpGain = totalXpGain
    let finalCoinsGain = habit.coinsReward

    if (goalReached) {
      finalXpGain += habit.xpReward * 5 // Bônus de 5x
      finalCoinsGain += habit.coinsReward * 5
    }

    const { newLevel, newXp, leveledUp } = applyXpGain(dbUser.level, dbUser.xp, finalXpGain)

    // Desbloquear conquistas
    const unlockedAchievements = await checkAndUnlockAchievements(String(user.id))

    await prisma.$transaction([
      prisma.habitCheckin.create({ data: { habitId } }),
      prisma.user.update({
        where: { id: String(user.id) },
        data: { 
          xp: newXp, 
          level: newLevel, 
          coins: { increment: finalCoinsGain },
          streak: newStreak,
          lastCheckin: now
        }
      }),
      prisma.transaction.create({
        data: {
          userId: String(user.id),
          xpAmount: finalXpGain,
          coinsAmount: finalCoinsGain,
          type: 'HABIT_COMPLETE',
          description: goalReached 
            ? `META ATINGIDA! Hábito: ${habit.name}` 
            : `Hábito: ${habit.name} ${bonusXp > 0 ? '(+Bônus de Classe!)' : ''}`
        }
      })
    ])

    return NextResponse.json({
      message: goalReached ? '🏆 META MENSAL ATINGIDA!' : 'Check-in realizado!',
      xpEarned: finalXpGain,
      coinsEarned: finalCoinsGain,
      leveledUp,
      newLevel,
      streak: newStreak,
      bonusXp,
      goalReached,
      unlockedAchievements
    }, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const { id: habitId } = await params
    const habit = await prisma.habit.findUnique({ where: { id: habitId } })
    if (!habit || habit.userId !== String(user.id)) {
      return NextResponse.json({ message: 'Hábito não encontrado' }, { status: 404 })
    }

    const today = new Date(); today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
    const existingCheckin = await prisma.habitCheckin.findFirst({
      where: { habitId, date: { gte: today, lt: tomorrow } }
    })
    if (!existingCheckin) return NextResponse.json({ message: 'Nenhum check-in hoje para desfazer' }, { status: 400 })

    const dbUser = await prisma.user.findUnique({ where: { id: String(user.id) } })
    if (!dbUser) return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 })

    // Recalcular o bônus que foi dado
    const bonusXp = getXpBonus(dbUser.characterClass, habit.category, habit.xpReward)
    const totalXpToLose = habit.xpReward + bonusXp

    // Calcular novo nível e XP após a perda
    const { newLevel, newXp } = applyXpLoss(dbUser.level, dbUser.xp, totalXpToLose)

    // ─── Lógica de Streak ao Desfazer ────────────────
    const otherCheckinsToday = await prisma.habitCheckin.findFirst({
      where: { 
        habit: { userId: String(user.id) },
        date: { gte: today, lt: tomorrow },
        id: { not: existingCheckin.id }
      }
    })

    const otherMissionsToday = await prisma.mission.findFirst({
      where: {
        userId: String(user.id),
        status: 'COMPLETED',
        completedAt: { gte: today, lt: tomorrow }
      }
    })

    const isLastActionOfDay = !otherCheckinsToday && !otherMissionsToday
    let streakUpdate = {}
    
    if (isLastActionOfDay) {
      // Buscar a data do último check-in antes de hoje para restaurar o lastCheckin
      const prevCheckin = await prisma.habitCheckin.findFirst({
        where: { habit: { userId: String(user.id) }, date: { lt: today } },
        orderBy: { date: 'desc' }
      })
      
      const prevMission = await prisma.mission.findFirst({
        where: { userId: String(user.id), status: 'COMPLETED', completedAt: { lt: today } },
        orderBy: { completedAt: 'desc' }
      })

      let lastDate = null
      if (prevCheckin && prevMission) {
        lastDate = prevCheckin.date > prevMission.completedAt! ? prevCheckin.date : prevMission.completedAt
      } else {
        lastDate = prevCheckin?.date || prevMission?.completedAt || null
      }

      streakUpdate = {
        streak: Math.max(0, dbUser.streak - 1),
        lastCheckin: lastDate
      }
    }

    await prisma.$transaction([
      prisma.habitCheckin.delete({ where: { id: existingCheckin.id } }),
      prisma.user.update({
        where: { id: String(user.id) },
        data: {
          xp: newXp,
          level: newLevel,
          coins: Math.max(0, dbUser.coins - habit.coinsReward),
          ...streakUpdate
        }
      }),
      prisma.transaction.create({
        data: {
          userId: String(user.id),
          xpAmount: -totalXpToLose,
          coinsAmount: -habit.coinsReward,
          type: 'HABIT_COMPLETE',
          description: `Desfez check-in: ${habit.name}`
        }
      })
    ])

    return NextResponse.json({ 
      message: 'Check-in desfeito!', 
      xpLost: totalXpToLose,
      newLevel,
      newXp
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

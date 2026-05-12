import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auth'
import { applyXpGain, checkAndUnlockAchievements } from '@/lib/game'

// POST — concluir missão
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const { id: missionId } = await params
    const mission = await prisma.mission.findUnique({ where: { id: missionId } })
    if (!mission || mission.userId !== String(user.id)) {
      return NextResponse.json({ message: 'Missão não encontrada' }, { status: 404 })
    }
    if (mission.status !== 'PENDING') {
      return NextResponse.json({ message: 'Missão já foi concluída ou cancelada' }, { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({ where: { id: String(user.id) } })
    if (!dbUser) return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 })

    const { newLevel, newXp, leveledUp } = applyXpGain(dbUser.level, dbUser.xp, mission.xpReward)

    const unlockedAchievements = await checkAndUnlockAchievements(String(user.id))

    // ─── Lógica de Streak ao Concluir ────────────────
    let newStreak = dbUser.streak
    const now = new Date()
    const last = dbUser.lastCheckin ? new Date(dbUser.lastCheckin) : null
    
    if (!last) {
      newStreak = 1
    } else {
      const today = new Date(); today.setHours(0,0,0,0)
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); yesterday.setHours(0,0,0,0)
      const lastDate = new Date(last); lastDate.setHours(0,0,0,0)
      
      if (lastDate.getTime() === yesterday.getTime()) {
        newStreak += 1
      } else if (lastDate.getTime() < yesterday.getTime()) {
        newStreak = 1
      }
    }

    await prisma.$transaction([
      prisma.mission.update({
        where: { id: missionId },
        data: { status: 'COMPLETED', completedAt: now }
      }),
      prisma.user.update({
        where: { id: String(user.id) },
        data: { 
          xp: newXp, 
          level: newLevel, 
          coins: { increment: mission.coinsReward },
          streak: newStreak,
          lastCheckin: now
        }
      }),
      prisma.transaction.create({
        data: {
          userId: String(user.id),
          xpAmount: mission.xpReward,
          coinsAmount: mission.coinsReward,
          type: 'MISSION_COMPLETE',
          description: `Missão concluída: ${mission.name}`
        }
      })
    ])

    return NextResponse.json({
      message: 'Missão concluída! 🎉',
      xpEarned: mission.xpReward,
      coinsEarned: mission.coinsReward,
      leveledUp,
      newLevel,
      unlockedAchievements
    }, { status: 200 })
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

// DELETE — cancelar missão
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const { id: missionId } = await params
    const mission = await prisma.mission.findUnique({ where: { id: missionId } })
    if (!mission || mission.userId !== String(user.id)) {
      return NextResponse.json({ message: 'Missão não encontrada' }, { status: 404 })
    }

    await prisma.mission.update({
      where: { id: missionId },
      data: { status: 'CANCELLED' }
    })

    return NextResponse.json({ message: 'Missão cancelada.' })
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

import { applyXpLoss } from '@/lib/game'

// PUT — desfazer conclusão
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const { id: missionId } = await params
    const mission = await prisma.mission.findUnique({ where: { id: missionId } })
    if (!mission || mission.userId !== String(user.id)) {
      return NextResponse.json({ message: 'Missão não encontrada' }, { status: 404 })
    }
    
    // Só pode desfazer se estiver COMPLETED nas últimas 24h
    if (mission.status !== 'COMPLETED' || !mission.completedAt) {
      return NextResponse.json({ message: 'Apenas missões concluídas podem ser desfeitas' }, { status: 400 })
    }
    
    const oneDayAgo = new Date(); oneDayAgo.setHours(oneDayAgo.getHours() - 24)
    if (mission.completedAt < oneDayAgo) {
      return NextResponse.json({ message: 'Já passou do prazo para desfazer (24h)' }, { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({ where: { id: String(user.id) } })
    if (!dbUser) return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 })

    const { newLevel, newXp } = applyXpLoss(dbUser.level, dbUser.xp, mission.xpReward)

    // ─── Lógica de Streak ao Desfazer ────────────────
    const today = new Date(); today.setHours(0,0,0,0)
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)

    const otherCheckinsToday = await prisma.habitCheckin.findFirst({
      where: { 
        habit: { userId: String(user.id) },
        date: { gte: today, lt: tomorrow }
      }
    })

    const otherMissionsToday = await prisma.mission.findFirst({
      where: {
        userId: String(user.id),
        status: 'COMPLETED',
        completedAt: { gte: today, lt: tomorrow },
        id: { not: missionId }
      }
    })

    const isLastActionOfDay = !otherCheckinsToday && !otherMissionsToday
    let streakUpdate = {}
    
    if (isLastActionOfDay) {
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
      prisma.mission.update({
        where: { id: missionId },
        data: { status: 'PENDING', completedAt: null }
      }),
      prisma.user.update({
        where: { id: String(user.id) },
        data: {
          xp: newXp,
          level: newLevel,
          coins: Math.max(0, dbUser.coins - mission.coinsReward),
          ...streakUpdate
        }
      }),
      prisma.transaction.create({
        data: {
          userId: String(user.id),
          xpAmount: -mission.xpReward,
          coinsAmount: -mission.coinsReward,
          type: 'MISSION_UNDO',
          description: `Desfez missão: ${mission.name}`
        }
      })
    ])

    return NextResponse.json({
      message: 'Conclusão desfeita!',
      xpLost: mission.xpReward,
      coinsLost: mission.coinsReward,
      newLevel
    }, { status: 200 })
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auth'
import { applyXpLoss } from '@/lib/game'

// POST — registrar que fez o mau hábito
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const { id: badHabitId } = await params
    const badHabit = await prisma.badHabit.findUnique({ where: { id: badHabitId } })
    if (!badHabit || badHabit.userId !== String(user.id)) {
      return NextResponse.json({ message: 'Mau hábito não encontrado' }, { status: 404 })
    }

    const dbUser = await prisma.user.findUnique({ where: { id: String(user.id) } })
    if (!dbUser) return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 })

    const { newLevel, newXp } = applyXpLoss(dbUser.level, dbUser.xp, badHabit.xpLost)

    const [log] = await prisma.$transaction([
      prisma.badHabitLog.create({
        data: { badHabitId, userId: String(user.id) }
      }),
      prisma.user.update({
        where: { id: String(user.id) },
        data: {
          xp: newXp,
          level: newLevel,
          coins: Math.max(0, dbUser.coins - badHabit.coinsLost)
        }
      }),
      prisma.transaction.create({
        data: {
          userId: String(user.id),
          xpAmount: -badHabit.xpLost,
          coinsAmount: -badHabit.coinsLost,
          type: 'BAD_HABIT',
          description: `Mau hábito registrado: ${badHabit.name}`
        }
      })
    ])

    return NextResponse.json({
      message: 'Mau hábito registrado.',
      xpLost: badHabit.xpLost,
      coinsLost: badHabit.coinsLost,
      logId: log.id
    }, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

// DELETE — desfazer registro mais recente (últimas 24h)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const { id: badHabitId } = await params
    const badHabit = await prisma.badHabit.findUnique({ where: { id: badHabitId } })
    if (!badHabit || badHabit.userId !== String(user.id)) {
      return NextResponse.json({ message: 'Mau hábito não encontrado' }, { status: 404 })
    }

    const oneDayAgo = new Date(); oneDayAgo.setHours(oneDayAgo.getHours() - 24)
    const latestLog = await prisma.badHabitLog.findFirst({
      where: { badHabitId, userId: String(user.id), date: { gte: oneDayAgo } },
      orderBy: { date: 'desc' }
    })
    if (!latestLog) return NextResponse.json({ message: 'Nenhum registro recente para desfazer' }, { status: 400 })

    const dbUser = await prisma.user.findUnique({ where: { id: String(user.id) } })
    if (!dbUser) return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 })

    const { newLevel, newXp } = { newLevel: dbUser.level, newXp: dbUser.xp }
    // Devolver XP/coins perdidos
    const restoredXp = dbUser.xp + badHabit.xpLost

    await prisma.$transaction([
      prisma.badHabitLog.delete({ where: { id: latestLog.id } }),
      prisma.user.update({
        where: { id: String(user.id) },
        data: { xp: restoredXp, coins: { increment: badHabit.coinsLost } }
      }),
      prisma.transaction.create({
        data: {
          userId: String(user.id),
          xpAmount: badHabit.xpLost,
          coinsAmount: badHabit.coinsLost,
          type: 'BAD_HABIT',
          description: `Desfez mau hábito: ${badHabit.name}`
        }
      })
    ])

    return NextResponse.json({ message: 'Registro desfeito!', xpReturned: badHabit.xpLost })
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

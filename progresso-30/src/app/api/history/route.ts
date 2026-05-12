import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const userId = String(user.id)

    const [transactions, checkins, badHabitLogs, completedMissions, redemptions] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 50
      }),
      prisma.habitCheckin.findMany({
        where: { habit: { userId } },
        include: { habit: { select: { name: true, xpReward: true, coinsReward: true } } },
        orderBy: { date: 'desc' },
        take: 30
      }),
      prisma.badHabitLog.findMany({
        where: { userId },
        include: { badHabit: { select: { name: true, xpLost: true, coinsLost: true } } },
        orderBy: { date: 'desc' },
        take: 30
      }),
      prisma.mission.findMany({
        where: { userId, status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
        take: 30
      }),
      prisma.rewardRedemption.findMany({
        where: { userId },
        include: { reward: { select: { name: true, coinCost: true } } },
        orderBy: { date: 'desc' },
        take: 30
      })
    ])

    return NextResponse.json({ transactions, checkins, badHabitLogs, completedMissions, redemptions })
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

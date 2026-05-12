import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const userId = String(user.id)

    // Buscar dados para o mapa de calor (últimos 30 dias)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    thirtyDaysAgo.setHours(0,0,0,0)

    const [transactions, checkins, badHabitLogs, completedMissions, redemptions, heatmapCheckins, heatmapMissions] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 50
      }),
      prisma.habitCheckin.findMany({
        where: { habit: { userId } },
        include: { habit: { select: { name: true, xpReward: true, coinsReward: true, id: true } } },
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
      }),
      prisma.habitCheckin.findMany({
        where: { habit: { userId }, date: { gte: thirtyDaysAgo } },
        select: { date: true }
      }),
      prisma.mission.findMany({
        where: { userId, status: 'COMPLETED', completedAt: { gte: thirtyDaysAgo } },
        select: { completedAt: true }
      })
    ])

    const heatmapData: Record<string, number> = {}
    heatmapCheckins.forEach(c => {
      const d = c.date.toISOString().split('T')[0]
      heatmapData[d] = (heatmapData[d] || 0) + 1
    })
    heatmapMissions.forEach(m => {
      if (m.completedAt) {
        const d = m.completedAt.toISOString().split('T')[0]
        heatmapData[d] = (heatmapData[d] || 0) + 1
      }
    })

    return NextResponse.json({ 
      transactions, 
      checkins, 
      badHabitLogs, 
      completedMissions, 
      redemptions,
      heatmapData
    })
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

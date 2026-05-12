import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const [allAchievements, userAchievements] = await Promise.all([
      prisma.achievement.findMany(),
      prisma.userAchievement.findMany({ where: { userId: String(user.id) } })
    ])

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId))

    const data = allAchievements.map(ach => ({
      ...ach,
      unlocked: unlockedIds.has(ach.id),
      unlockedAt: userAchievements.find(ua => ua.achievementId === ach.id)?.unlockedAt
    }))

    // Ordenar: desbloqueados primeiro
    data.sort((a, b) => (a.unlocked === b.unlocked ? 0 : a.unlocked ? -1 : 1))

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

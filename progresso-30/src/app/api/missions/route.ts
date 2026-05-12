import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auth'
import { DIFFICULTY_CONFIG } from '@/lib/game'

export async function GET() {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const missions = await prisma.mission.findMany({
      where: { userId: String(user.id) },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(missions)
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const { name, description, difficulty } = await request.json()
    if (!name || !difficulty) return NextResponse.json({ message: 'Dados incompletos' }, { status: 400 })

    const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG]
    if (!config) return NextResponse.json({ message: 'Dificuldade inválida' }, { status: 400 })

    const mission = await prisma.mission.create({
      data: {
        userId: String(user.id),
        name,
        description,
        difficulty,
        xpReward: config.xp,
        coinsReward: config.coins,
      }
    })
    return NextResponse.json(mission, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

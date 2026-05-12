import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auth'

// GET — listar recompensas do usuário
export async function GET() {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const rewards = await prisma.reward.findMany({
      where: { userId: String(user.id) },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(rewards)
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

// POST — criar nova recompensa
export async function POST(request: Request) {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const { name, description, coinCost, levelRequired, category } = await request.json()
    if (!name || !category) return NextResponse.json({ message: 'Dados incompletos' }, { status: 400 })

    const reward = await prisma.reward.create({
      data: {
        userId: String(user.id),
        name,
        description,
        coinCost: Number(coinCost) || 100,
        levelRequired: Number(levelRequired) || 1,
        category,
      }
    })
    return NextResponse.json(reward, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

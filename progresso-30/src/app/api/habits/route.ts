import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auth'
import { applyXpGain, xpForNextLevel } from '@/lib/game'

export async function GET() {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const habits = await prisma.habit.findMany({
      where: { userId: String(user.id) },
      include: { checkins: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(habits)
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const { name, category, frequency, goal, xpReward, coinsReward } = await request.json()
    if (!name || !category || !frequency) return NextResponse.json({ message: 'Dados incompletos' }, { status: 400 })

    const habit = await prisma.habit.create({
      data: {
        userId: String(user.id),
        name,
        category,
        frequency,
        goal: Number(goal) || 30,
        xpReward: Number(xpReward) || 10,
        coinsReward: Number(coinsReward) || 5,
      }
    })
    return NextResponse.json(habit, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

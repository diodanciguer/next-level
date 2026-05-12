import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auth'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const { id } = await params
    const habit = await prisma.habit.findUnique({ where: { id } })
    if (!habit || habit.userId !== String(user.id)) {
      return NextResponse.json({ message: 'Hábito não encontrado' }, { status: 404 })
    }

    await prisma.habit.delete({ where: { id } })
    return NextResponse.json({ message: 'Hábito deletado com sucesso' })
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const { id } = await params
    const { name, category, frequency, goal, xpReward, coinsReward } = await request.json()

    const habit = await prisma.habit.findUnique({ where: { id } })
    if (!habit || habit.userId !== String(user.id)) {
      return NextResponse.json({ message: 'Hábito não encontrado' }, { status: 404 })
    }

    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: {
        name: name || habit.name,
        category: category || habit.category,
        frequency: frequency || habit.frequency,
        goal: goal ? Number(goal) : habit.goal,
        xpReward: xpReward ? Number(xpReward) : habit.xpReward,
        coinsReward: coinsReward ? Number(coinsReward) : habit.coinsReward,
      }
    })

    return NextResponse.json(updatedHabit)
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

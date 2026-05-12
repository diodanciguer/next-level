import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const badHabits = await prisma.badHabit.findMany({
      where: { userId: String(user.id) },
      include: { logs: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(badHabits)
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const { name, description, category, xpLost, coinsLost } = await request.json()
    if (!name || !category) return NextResponse.json({ message: 'Dados incompletos' }, { status: 400 })

    const badHabit = await prisma.badHabit.create({
      data: {
        userId: String(user.id),
        name,
        description,
        category,
        xpLost: Number(xpLost) || 10,
        coinsLost: Number(coinsLost) || 0,
      }
    })
    return NextResponse.json(badHabit, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auth'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const { id } = await params

    const badHabit = await prisma.badHabit.findUnique({
      where: { id }
    })

    if (!badHabit || badHabit.userId !== String(user.id)) {
      return NextResponse.json({ message: 'Não encontrado' }, { status: 404 })
    }

    await prisma.badHabit.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Mau hábito removido' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const { id } = await params
    const { name, description, category, xpLost, coinsLost } = await request.json()

    const badHabit = await prisma.badHabit.findUnique({ where: { id } })
    if (!badHabit || badHabit.userId !== String(user.id)) {
      return NextResponse.json({ message: 'Mau hábito não encontrado' }, { status: 404 })
    }

    const updatedBadHabit = await prisma.badHabit.update({
      where: { id },
      data: {
        name: name || badHabit.name,
        description: description !== undefined ? description : badHabit.description,
        category: category || badHabit.category,
        xpLost: xpLost ? Number(xpLost) : badHabit.xpLost,
        coinsLost: coinsLost ? Number(coinsLost) : badHabit.coinsLost,
      }
    })

    return NextResponse.json(updatedBadHabit)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

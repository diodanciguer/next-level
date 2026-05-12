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

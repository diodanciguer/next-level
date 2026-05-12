import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auth'
import { getRank } from '@/lib/game'

export async function GET() {
  try {
    const session = await getUserFromSession()
    if (!session) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: String(session.id) },
      select: { id: true, name: true, email: true, xp: true, level: true, coins: true, characterClass: true, streak: true }
    })
    if (!user) return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 })

    return NextResponse.json({ ...user, rank: getRank(user.level) })
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

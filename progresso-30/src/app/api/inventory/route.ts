import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const inventory = await prisma.rewardRedemption.findMany({
      where: { userId: String(user.id), used: false },
      include: { reward: true },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(inventory)
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

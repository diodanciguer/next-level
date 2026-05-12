import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auth'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const { id: rewardId } = await params
    const reward = await prisma.reward.findUnique({ where: { id: rewardId } })
    if (!reward || reward.userId !== String(user.id)) {
      return NextResponse.json({ message: 'Recompensa não encontrada' }, { status: 404 })
    }

    const dbUser = await prisma.user.findUnique({ where: { id: String(user.id) } })
    if (!dbUser) return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 })

    if (dbUser.level < reward.levelRequired) {
      return NextResponse.json({
        message: `Nível insuficiente. Esta recompensa requer Nível ${reward.levelRequired}.`
      }, { status: 400 })
    }
    if (dbUser.coins < reward.coinCost) {
      return NextResponse.json({ message: 'Moedas insuficientes para resgatar.' }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.rewardRedemption.create({
        data: { userId: String(user.id), rewardId: reward.id }
      }),
      prisma.user.update({
        where: { id: String(user.id) },
        data: { coins: { decrement: reward.coinCost } }
      }),
      prisma.transaction.create({
        data: {
          userId: String(user.id),
          xpAmount: 0,
          coinsAmount: -reward.coinCost,
          type: 'REWARD_REDEEM',
          description: `Recompensa resgatada: ${reward.name}`
        }
      })
    ])

    return NextResponse.json({ message: 'Recompensa resgatada! 🎁' }, { status: 201 })
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const { id: rewardId } = await params
    const reward = await prisma.reward.findUnique({ where: { id: rewardId } })
    if (!reward || reward.userId !== String(user.id)) {
      return NextResponse.json({ message: 'Recompensa não encontrada' }, { status: 404 })
    }

    const oneDayAgo = new Date(); oneDayAgo.setHours(oneDayAgo.getHours() - 24)
    const latestRedemption = await prisma.rewardRedemption.findFirst({
      where: { 
        rewardId, 
        userId: String(user.id), 
        date: { gte: oneDayAgo },
        used: false // Crucial: não pode desfazer se já usou!
      },
      orderBy: { date: 'desc' }
    })
    if (!latestRedemption) {
      return NextResponse.json({ message: 'Nenhum resgate disponível para desfazer (já usado ou expirado)' }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.rewardRedemption.delete({ where: { id: latestRedemption.id } }),
      prisma.user.update({
        where: { id: String(user.id) },
        data: { coins: { increment: reward.coinCost } }
      }),
      prisma.transaction.create({
        data: {
          userId: String(user.id),
          xpAmount: 0,
          coinsAmount: reward.coinCost,
          type: 'REWARD_REDEEM',
          description: `Desfez resgate: ${reward.name}`
        }
      })
    ])

    return NextResponse.json({ message: 'Resgate desfeito!', coinsReturned: reward.coinCost }, { status: 200 })
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

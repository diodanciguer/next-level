import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auth'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const { id } = await params

    const item = await prisma.rewardRedemption.findUnique({
      where: { id },
      include: { reward: true }
    })

    if (!item || item.userId !== String(user.id)) {
      return NextResponse.json({ message: 'Item não encontrado' }, { status: 404 })
    }

    if (item.used) {
      return NextResponse.json({ message: 'Este item já foi usado' }, { status: 400 })
    }

    let xpBonus = 0
    let message = `Você usou: ${item.reward.name}! Aproveite sua recompensa.`

    if (item.reward.name === 'Poção de XP') {
      xpBonus = 100 // Ganha 100 XP
      message = `Você bebeu a Poção de XP e ganhou +100 XP! ✨`
    }

    const dbUser = await prisma.user.findUnique({ where: { id: String(user.id) } })
    if (!dbUser) return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 })

    // Se tiver bônus de XP, aplicar lógica de level up
    let updateData: any = { used: true, usedAt: new Date() }
    let leveledUp = false
    let newLevel = dbUser.level

    if (xpBonus > 0) {
      const result = await (await import('@/lib/game')).applyXpGain(dbUser.level, dbUser.xp, xpBonus)
      updateData = {
        ...updateData,
        user: {
          update: {
            xp: result.newXp,
            level: result.newLevel
          }
        }
      }
      leveledUp = result.leveledUp
      newLevel = result.newLevel
    }

    await prisma.rewardRedemption.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ 
      message,
      rewardName: item.reward.name,
      leveledUp,
      newLevel
    })
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

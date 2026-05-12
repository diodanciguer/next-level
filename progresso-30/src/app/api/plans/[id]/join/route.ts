import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auth'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromSession()
    if (!user) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
    }

    const { id: planId } = await params

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: { planHabits: true }
    })

    if (!plan) {
      return NextResponse.json({ message: 'Plano não encontrado' }, { status: 404 })
    }

    // Check if user already joined this plan actively
    const existingUserPlan = await prisma.userPlan.findFirst({
      where: {
        userId: String(user.id),
        planId: plan.id,
        status: 'ACTIVE'
      }
    })

    if (existingUserPlan) {
      return NextResponse.json({ message: 'Você já está participando deste plano ativamente' }, { status: 400 })
    }

    // Join plan and create habits
    await prisma.$transaction(async (tx) => {
      // Create user plan relationship
      await tx.userPlan.create({
        data: {
          userId: String(user.id),
          planId: plan.id,
          status: 'ACTIVE'
        }
      })

      // Create habits for the user based on plan habits
      for (const ph of plan.planHabits) {
        await tx.habit.create({
          data: {
            userId: String(user.id),
            name: ph.name,
            category: ph.category,
            frequency: 'diário',
            goal: ph.goal,
            xpReward: ph.xpReward,
            coinsReward: ph.coinsReward,
            planHabitId: ph.id
          }
        })
      }
    })

    return NextResponse.json({ message: 'Você entrou no plano com sucesso! Os hábitos foram adicionados.' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

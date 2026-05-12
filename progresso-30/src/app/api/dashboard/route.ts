import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auth'
import { getRank } from '@/lib/game'

export async function GET() {
  try {
    const session = await getUserFromSession()
    if (!session) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const userId = String(session.id)

    const [user, habits, badHabits, missions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, xp: true, level: true, coins: true, characterClass: true }
      }),
      prisma.habit.findMany({
        where: { userId, active: true },
        include: { 
          checkins: { 
            where: { 
              date: { 
                gte: (() => { 
                  const d = new Date(); 
                  d.setHours(0,0,0,0);
                  // Se hoje for domingo(0), volta 6 dias. Se for segunda(1), volta 0.
                  const day = d.getDay();
                  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
                  d.setDate(diff);
                  return d;
                })() 
              } 
            } 
          } 
        }
      }),
      prisma.badHabit.findMany({
        where: { userId, active: true },
        include: { logs: { where: { date: { gte: (() => { const d = new Date(); d.setHours(0,0,0,0); return d })() } } } }
      }),
      prisma.mission.findMany({
        where: { userId, status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ])

    if (!user) return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 })

    return NextResponse.json({
      user: { ...user, rank: getRank(user.level) },
      habits,
      badHabits,
      missions
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

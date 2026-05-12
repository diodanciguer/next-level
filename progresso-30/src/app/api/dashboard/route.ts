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
                  const local = new Date(d.getTime() - (3 * 60 * 60 * 1000));
                  local.setHours(0,0,0,0);
                  const startOfMonday = new Date(local.getTime());
                  // Se hoje for domingo(0), volta 6 dias. Se for segunda(1), volta 0.
                  const day = startOfMonday.getDay();
                  const diff = startOfMonday.getDate() - (day === 0 ? 6 : day - 1);
                  startOfMonday.setDate(diff);
                  // Volta para UTC
                  return new Date(startOfMonday.getTime() + (3 * 60 * 60 * 1000));
                })() 
              } 
            } 
          } 
        }
      }),
      prisma.badHabit.findMany({
        where: { userId, active: true },
        include: { 
          logs: { 
            where: { 
              date: { 
                gte: (() => { 
                  const d = new Date(); 
                  const local = new Date(d.getTime() - (3 * 60 * 60 * 1000));
                  local.setHours(0,0,0,0);
                  return new Date(local.getTime() + (3 * 60 * 60 * 1000));
                })() 
              } 
            } 
          } 
        }
      }),
      prisma.mission.findMany({
        where: { userId, status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ])

    if (!user) return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 })
    
    // Calcular ganhos de hoje (ajustado para fuso -3h Brasília)
    const now = new Date()
    const todayLocal = new Date(now.getTime() - (3 * 60 * 60 * 1000))
    todayLocal.setHours(0,0,0,0)
    const todayUTC = new Date(todayLocal.getTime() + (3 * 60 * 60 * 1000))

    const todayTransactions = await prisma.transaction.findMany({
      where: { 
        userId, 
        date: { gte: todayUTC },
        type: { in: ['HABIT_COMPLETE', 'MISSION_COMPLETE'] }
      }
    })
    
    const todayStats = todayTransactions.reduce((acc, t) => ({
      xp: acc.xp + t.xpAmount,
      coins: acc.coins + t.coinsAmount
    }), { xp: 0, coins: 0 })

    return NextResponse.json({
      user: { ...user, rank: getRank(user.level) },
      habits,
      badHabits,
      missions,
      todayStats
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

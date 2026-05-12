import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auth'
import { startOfDay, subDays, format, eachDayOfInterval } from 'date-fns'

export async function GET() {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const userId = String(user.id)
    const now = new Date()
    const sevenDaysAgo = startOfDay(subDays(now, 6))

    // 1. Ganhos de XP por dia (últimos 7 dias)
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: sevenDaysAgo },
        xpAmount: { not: 0 }
      },
      orderBy: { date: 'asc' }
    })

    // 2. Consistência de Hábitos por dia (últimos 7 dias)
    const checkins = await prisma.habitCheckin.findMany({
      where: {
        habit: { userId },
        date: { gte: sevenDaysAgo }
      },
      include: { habit: true }
    })

    // 3. Distribuição de XP por categoria
    // Vamos pegar todos os checkins e somar o XP configurado no hábito
    const categoryMap: Record<string, number> = {}
    checkins.forEach(c => {
      const cat = c.habit.category || 'Outro'
      categoryMap[cat] = (categoryMap[cat] || 0) + c.habit.xpReward
    })

    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))

    // Formatar dados para os gráficos (dia a dia)
    const days = eachDayOfInterval({ start: sevenDaysAgo, end: now })
    
    const chartData = days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dayLabel = format(day, 'dd/MM')

      // Soma XP do dia
      const dayXp = transactions
        .filter(t => format(new Date(t.date), 'yyyy-MM-dd') === dateStr)
        .reduce((sum, t) => sum + t.xpAmount, 0)

      // Conta hábitos do dia
      const dayHabits = checkins
        .filter(c => format(new Date(c.date), 'yyyy-MM-dd') === dateStr)
        .length

      return {
        date: dateStr,
        label: dayLabel,
        xp: Math.max(0, dayXp),
        habits: dayHabits
      }
    })

    // Estatísticas Gerais
    const totalXp = chartData.reduce((sum, d) => sum + d.xp, 0)
    const totalHabits = chartData.reduce((sum, d) => sum + d.habits, 0)
    const bestDay = [...chartData].sort((a, b) => b.xp - a.xp)[0]

    return NextResponse.json({
      chartData,
      categoryData,
      stats: {
        totalXp,
        totalHabits,
        avgXp: Math.round(totalXp / 7),
        bestDay: bestDay?.xp > 0 ? bestDay : null
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

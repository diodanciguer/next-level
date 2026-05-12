import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Populando banco com conquistas e planos...')

    const plans = [
      {
        name: 'Plano Voltar para Academia',
        description: 'Retome o ritmo e cuide da sua saúde com foco e disciplina.',
        habits: [
          { name: 'Academia',             category: 'Saúde',    goal: 12, xpReward: 40, coinsReward: 20 },
          { name: 'Beber 2L de água',     category: 'Saúde',    goal: 30, xpReward: 10, coinsReward: 5  },
          { name: 'Dormir antes de 23h',  category: 'Saúde',    goal: 20, xpReward: 15, coinsReward: 5  },
          { name: 'Registrar peso',       category: 'Saúde',    goal: 4,  xpReward: 5,  coinsReward: 2  },
        ]
      },
      {
        name: 'Plano Produtividade',
        description: 'Dobre sua capacidade de realizar e mantenha o foco no que importa.',
        habits: [
          { name: 'Estudar 30 minutos',        category: 'Estudos',  goal: 20, xpReward: 25, coinsReward: 10 },
          { name: 'Planejar o dia',            category: 'Trabalho', goal: 30, xpReward: 10, coinsReward: 5  },
          { name: 'Foco sem celular',          category: 'Trabalho', goal: 20, xpReward: 20, coinsReward: 10 },
          { name: 'Concluir tarefa importante',category: 'Trabalho', goal: 30, xpReward: 30, coinsReward: 15 },
        ]
      },
      {
        name: 'Plano Financeiro',
        description: 'Organize suas finanças, poupe dinheiro e evite gastos desnecessários.',
        habits: [
          { name: 'Não gastar por impulso', category: 'Finanças', goal: 30, xpReward: 25, coinsReward: 10 },
          { name: 'Anotar gastos',          category: 'Finanças', goal: 30, xpReward: 15, coinsReward: 5  },
          { name: 'Guardar dinheiro',       category: 'Finanças', goal: 4,  xpReward: 50, coinsReward: 25 },
          { name: 'Conferir contas',        category: 'Finanças', goal: 4,  xpReward: 20, coinsReward: 10 },
        ]
      }
    ]

    for (const p of plans) {
      const existing = await prisma.plan.findFirst({ where: { name: p.name } })
      if (!existing) {
        await prisma.plan.create({
          data: {
            name: p.name,
            description: p.description,
            planHabits: { create: p.habits }
          }
        })
      }
    }

    const achievements = [
      { name: 'Primeiros Passos', description: 'Conclua seu primeiro hábito.', icon: '🌱', type: 'HABITS_COUNT', threshold: 1 },
      { name: 'Habitante', description: 'Conclua 50 hábitos.', icon: '🏠', type: 'HABITS_COUNT', threshold: 50 },
      { name: 'Mestre da Rotina', description: 'Conclua 200 hábitos.', icon: '👑', type: 'HABITS_COUNT', threshold: 200 },
      { name: 'Nível 10', description: 'Alcance o nível 10.', icon: '💎', type: 'LEVEL', threshold: 10 },
      { name: 'Veterano', description: 'Alcance o nível 50.', icon: '🛡️', type: 'LEVEL', threshold: 50 },
      { name: 'Lenda', description: 'Alcance o nível 100.', icon: '🔥', type: 'LEVEL', threshold: 100 },
      { name: 'Fogo no Rabo', description: 'Alcance uma streak de 7 dias.', icon: '🔥', type: 'STREAK', threshold: 7 },
      { name: 'Imbatível', description: 'Alcance uma streak de 30 dias.', icon: '⚡', type: 'STREAK', threshold: 30 },
    ]

    let createdCount = 0
    for (const a of achievements) {
      const existing = await prisma.achievement.findFirst({ where: { name: a.name } })
      if (!existing) {
        await prisma.achievement.create({ data: a })
        createdCount++
      }
    }

    return NextResponse.json({ 
      message: 'Banco populado com sucesso!', 
      achievementsCreated: createdCount,
      plansChecked: plans.length
    })
  } catch (error: any) {
    return NextResponse.json({ message: 'Erro ao popular banco', error: error.message }, { status: 500 })
  }
}

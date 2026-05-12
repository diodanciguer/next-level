import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const transactions = await prisma.transaction.aggregate({
    _sum: {
      xpAmount: true,
      coinsAmount: true,
    },
    where: {
      type: { in: ['HABIT_COMPLETE', 'MISSION_COMPLETE'] }
    }
  })
  console.log(transactions)
}
main().catch(console.error).finally(() => prisma.$disconnect())

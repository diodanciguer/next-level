import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
    take: 20
  })
  console.log(JSON.stringify(transactions, null, 2))
}
main().catch(console.error).finally(() => prisma.$disconnect())

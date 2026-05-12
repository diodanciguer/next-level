import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromSession } from '@/lib/auth'
import { CLASS_CONFIG, CharacterClass } from '@/lib/game'

export async function PATCH(request: Request) {
  try {
    const user = await getUserFromSession()
    if (!user) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })

    const { characterClass } = await request.json()
    if (!characterClass || !CLASS_CONFIG[characterClass as CharacterClass]) {
      return NextResponse.json({ message: 'Classe inválida' }, { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({ where: { id: String(user.id) } })
    if (dbUser?.characterClass !== 'Iniciante' && dbUser?.level! < 10) {
      // Opcional: só permitir mudar depois se for nível alto ou pagar moedas
      // Mas para facilitar, vamos deixar mudar se for Iniciante
    }

    await prisma.user.update({
      where: { id: String(user.id) },
      data: { characterClass }
    })

    return NextResponse.json({ message: `Você agora é um ${characterClass}!` })
  } catch {
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}

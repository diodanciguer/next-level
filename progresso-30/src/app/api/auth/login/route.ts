import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signJwtToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: 'E-mail e senha são obrigatórios' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ message: 'E-mail ou senha inválidos' }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'E-mail ou senha inválidos' }, { status: 401 })
    }

    const token = await signJwtToken({ id: user.id, email: user.email, name: user.name })

    const response = NextResponse.json({ message: 'Login realizado com sucesso', user: { id: user.id, name: user.name, email: user.email } }, { status: 200 })

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Error during login', error)
    return NextResponse.json({ message: 'Erro interno no servidor' }, { status: 500 })
  }
}

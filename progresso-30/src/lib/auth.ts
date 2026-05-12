import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'super-secret-key-for-dev'
  if (!secret) {
    throw new Error('JWT Secret key is not matched')
  }
  return new TextEncoder().encode(secret)
}

export async function verifyJwtToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey())
    return payload
  } catch (error) {
    return null
  }
}

export async function signJwtToken(payload: any) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecretKey())
  
  return token
}

export async function getUserFromSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) return null

  const verifiedToken = await verifyJwtToken(token)

  return verifiedToken
}

import { SpaceDFClient } from '@/lib/spacedf'
import { readSession } from '@/utils/server-actions'
import { encode } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

const createAuthCookieString = (token: string) => {
  const SESSION_SECURE = process.env.NEXTAUTH_URL?.startsWith('https://')
  const SESSION_SALT = SESSION_SECURE
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token'

  return `${SESSION_SALT}=${token}; Path=/; HttpOnly; SameSite=Lax${
    SESSION_SECURE ? '; Secure' : ''
  }`
}

export const POST = async () => {
  const session = await readSession()
  const refreshToken = session?.user?.refresh
  if (!refreshToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const spacedf = await SpaceDFClient.getInstance()
  const client = spacedf.getClient()
  const SESSION_SECURE = process.env.NEXTAUTH_URL?.startsWith('https://')
  const SESSION_SALT = SESSION_SECURE
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token'
  const data = await client.auth.refreshToken({
    refresh: refreshToken,
  })
  spacedf.setToken(data.access as string)
  const newSessionToken = await encode({
    secret: process.env.NEXTAUTH_SECRET as string,
    token: data,
    salt: SESSION_SALT,
  })

  const response = NextResponse.json(data)
  response.headers.set('Set-Cookie', createAuthCookieString(newSessionToken))

  return response
}

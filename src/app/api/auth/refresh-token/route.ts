import { auth } from '@/lib/auth'
import { SpaceDFClient } from '@/lib/spacedf'
import { encode } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

const createAuthCookieString = (token: string) => {
  const SESSION_SECURE = process.env.NEXTAUTH_URL?.startsWith('https://')
  const SESSION_SALT = SESSION_SECURE
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token'

  return `${SESSION_SALT}=${token}; Path=/; HttpOnly; SameSite=Lax${
    SESSION_SECURE ? '; Secure' : ''
  }`
}

const refreshLocks = new Map<string, Promise<any>>()

export const POST = async (request: NextRequest) => {
  const abortController = new AbortController()

  // Listen for client disconnect
  request.signal.addEventListener('abort', () => {
    abortController.abort()
  })
  try {
    const session = await auth()
    const refreshToken = session?.user?.refresh
    if (!refreshToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (refreshLocks.has(refreshToken)) {
      return await refreshLocks.get(refreshToken)!
    }
    if (request.signal.aborted) {
      return NextResponse.json({ error: 'Request aborted' }, { status: 499 })
    }
    const refreshPromise = (async () => {
      try {
        const spacedf = await SpaceDFClient.getInstance()
        const client = spacedf.getClient()
        const data = await client.auth.refreshToken(
          { refresh: refreshToken },
          { signal: abortController.signal }
        )

        const SESSION_SECURE = process.env.NEXTAUTH_URL?.startsWith('https://')
        const SESSION_SALT = SESSION_SECURE
          ? '__Secure-authjs.session-token'
          : 'authjs.session-token'

        const newSessionToken = await encode({
          secret: process.env.NEXTAUTH_SECRET as string,
          token: data,
          salt: SESSION_SALT,
        })

        const response = NextResponse.json(data)
        response.headers.set(
          'Set-Cookie',
          createAuthCookieString(newSessionToken)
        )
        return response
      } finally {
        refreshLocks.delete(refreshToken)
      }
    })()

    refreshLocks.set(refreshToken, refreshPromise)
    return await refreshPromise
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

import { cookies } from 'next/headers'
import { isJsonString } from './validate'
import { getValidSubdomain } from './subdomain'
import { NextRequest } from 'next/server'
import { DEMO_SUBDOMAIN } from '@/constants'
import { decode } from 'next-auth/jwt'
import { Session } from 'next-auth'

export const getCookieServer = <TDefaultValue = any>(
  key: string,
  defaultValue: TDefaultValue
) => {
  const cookie = cookies().get(key)

  if (cookie)
    return isJsonString(cookie.value)
      ? JSON.parse(cookie.value)
      : (cookie.value as TDefaultValue)

  return defaultValue
}

export const getServerOrganization = async () => {
  const cookieStore = await cookies()
  return (cookieStore.get('organization')?.value || '') as string
}

export const isDemoSubdomain = async (req: NextRequest) => {
  const host = req.headers.get('host')
  const subdomain = await getValidSubdomain(host)
  return subdomain === DEMO_SUBDOMAIN
}

export const isDanangSubdomain = async (req: NextRequest) => {
  const host = req.headers.get('host')
  const subdomain = await getValidSubdomain(host)
  return subdomain === 'danang'
}

const SESSION_SECURE = process.env.NEXTAUTH_URL?.startsWith('https://')
const SESSION_SALT = SESSION_SECURE
  ? '__Secure-authjs.session-token'
  : 'authjs.session-token'

export async function readSession() {
  const encodedSession = cookies().get(SESSION_SALT)?.value
  if (!encodedSession) {
    return null
  }

  try {
    const session = await decode({
      token: encodedSession,
      secret: process.env.NEXTAUTH_SECRET as string,
      salt: SESSION_SALT,
    })
    return { user: session } as unknown as Session
  } catch {
    return null
  }
}

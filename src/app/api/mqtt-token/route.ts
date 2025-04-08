import { decode } from 'next-auth/jwt'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const sessionCookie = cookies().get('next-auth.session-token')?.value
  if (!sessionCookie) {
    return NextResponse.json(
      { error: 'No session cookie found' },
      { status: 401 }
    )
  }

  const decoded = await decode({
    token: sessionCookie,
    secret: process.env.NEXTAUTH_SECRET || '',
    salt: '',
  })

  return NextResponse.json({ mqtt_token: decoded?.access })
}

import { readSession } from '@/utils/server-actions'
import { NextResponse } from 'next/server'

export async function GET() {
  const sessionCookie = await readSession()
  return NextResponse.json({ mqtt_token: sessionCookie?.user?.access })
}

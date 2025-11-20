import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { readSession } from '@/utils/server-actions'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const sessionCookie = await readSession()
    if (!sessionCookie) {
      return NextResponse.json({ mqtt_token: null })
    }
    const spacedfClient = await spaceClient()
    spacedfClient.setAccessToken(sessionCookie?.user?.access)
    await spacedfClient.users.getMe()
    return NextResponse.json({ mqtt_token: sessionCookie?.user?.access })
  } catch (error) {
    return handleError(error)
  }
}

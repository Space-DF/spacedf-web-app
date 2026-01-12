import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { isDemoSubdomain, readSession } from '@/utils/server-actions'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = await readSession()
    const isDemo = await isDemoSubdomain(req)
    if (!sessionCookie || isDemo) {
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

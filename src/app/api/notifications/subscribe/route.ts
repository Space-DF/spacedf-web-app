import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { NextRequest, NextResponse } from 'next/server'

export const POST = withAuthApiRequired(async (request: NextRequest) => {
  const body = await request.json()
  const spacedfClient = await spaceClient()
  const subscription =
    await spacedfClient.telemetry.notifications.subscribe(body)
  return NextResponse.json(subscription)
})

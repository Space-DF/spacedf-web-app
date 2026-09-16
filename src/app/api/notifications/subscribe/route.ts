import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { isDemoSubdomain } from '@/utils/server-actions'
import { NextRequest, NextResponse } from 'next/server'

export const POST = withAuthApiRequired(async (request: NextRequest) => {
  const isDemo = await isDemoSubdomain(request)
  if (isDemo) return NextResponse.json(null)
  const body = await request.json()
  const spacedfClient = await spaceClient()
  const subscription =
    await spacedfClient.telemetry.notifications.subscribe(body)
  return NextResponse.json(subscription)
})

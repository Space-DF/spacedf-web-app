import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { NextRequest, NextResponse } from 'next/server'

export const GET = withAuthApiRequired(async (request: NextRequest) => {
  const spaceSlug = request.nextUrl.searchParams.get('spaceSlug') || ''
  const spacedfClient = await spaceClient()
  const automations = await spacedfClient.telemetry.automations.summary({
    headers: {
      'X-Space': spaceSlug,
    },
  })
  return NextResponse.json(automations)
})

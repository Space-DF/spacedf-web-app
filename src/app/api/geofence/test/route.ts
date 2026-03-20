import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { NextRequest, NextResponse } from 'next/server'
import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'

export const POST = withAuthApiRequired(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const spaceSlug = request.nextUrl.searchParams.get('spaceSlug') || ''
    const client = await spaceClient()
    const result = await client.telemetry.geofences.test(body, {
      headers: {
        'X-Space': spaceSlug,
      },
    })
    return NextResponse.json(result)
  } catch (error) {
    return handleError(error)
  }
})

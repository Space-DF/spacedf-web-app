import { spaceClient } from '@/lib/spacedf'
import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { NextRequest, NextResponse } from 'next/server'
import { handleError } from '@/utils/error'

export const GET = withAuthApiRequired(async (req: NextRequest) => {
  try {
    const display_type = req.nextUrl.searchParams.get('type') || undefined
    const search = req.nextUrl.searchParams.get('search') || undefined
    const spaceSlug = req.nextUrl.searchParams.get('spaceSlug')
    const deviceId = req.nextUrl.searchParams.get('deviceId') || undefined
    const spacedfClient = await spaceClient()
    const params = {
      display_type,
      search,
      device_id: deviceId,
    }
    const entities = await spacedfClient.telemetry.entities.list(params, {
      headers: {
        'X-Space': spaceSlug,
      },
    })
    return NextResponse.json(entities)
  } catch (error) {
    return handleError(error)
  }
})

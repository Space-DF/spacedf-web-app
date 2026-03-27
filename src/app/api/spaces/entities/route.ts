import { spaceClient } from '@/lib/spacedf'
import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { NextRequest, NextResponse } from 'next/server'
import { handleError } from '@/utils/error'
import { DEFAULT_PAGE_SIZE } from '@/constants'

export const GET = withAuthApiRequired(async (req: NextRequest) => {
  try {
    const display_type = req.nextUrl.searchParams.get('type') || undefined
    const search = req.nextUrl.searchParams.get('search') || undefined
    const spaceSlug = req.nextUrl.searchParams.get('spaceSlug')
    const deviceId = req.nextUrl.searchParams.get('deviceId') || undefined
    const offset = req.nextUrl.searchParams.get('offset') || 0
    const limit = req.nextUrl.searchParams.get('limit') || DEFAULT_PAGE_SIZE
    const spacedfClient = await spaceClient()
    const params = {
      display_type,
      search,
      device_id: deviceId,
      offset: +offset,
      limit: +limit,
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

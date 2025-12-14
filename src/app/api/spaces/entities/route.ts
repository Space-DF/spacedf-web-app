import { spaceClient } from '@/lib/spacedf'
import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { NextRequest, NextResponse } from 'next/server'
import { handleError } from '@/utils/error'

export const GET = withAuthApiRequired(async (req: NextRequest) => {
  try {
    const display_type = req.nextUrl.searchParams.get('type') || undefined
    const search = req.nextUrl.searchParams.get('search') || undefined
    const spaceSlug = req.nextUrl.searchParams.get('spaceSlug')
    const spacedfClient = await spaceClient()
    const entities = await spacedfClient.telemetry.entities.list(
      {
        display_type,
        search,
      },
      {
        headers: {
          'X-Space': spaceSlug,
        },
      }
    )
    return NextResponse.json(entities)
  } catch (error) {
    return handleError(error)
  }
})

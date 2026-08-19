import { NextRequest, NextResponse } from 'next/server'
import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { DEFAULT_PAGE_SIZE } from '@/constants'

export const GET = withAuthApiRequired(
  async (
    request: NextRequest,
    props: { params: Promise<{ deviceId: string }> }
  ) => {
    const params = await props.params
    const { deviceId } = params
    const spaceSlug = request.nextUrl.searchParams.get('spaceSlug')
    const limit = request.nextUrl.searchParams.get('limit') || DEFAULT_PAGE_SIZE
    const offset = request.nextUrl.searchParams.get('offset') || '0'
    const search = request.nextUrl.searchParams.get('search') || ''
    const client = await spaceClient()
    const events = await client.telemetry.events.list(
      deviceId,
      {
        limit: +limit,
        offset: +offset,
        search,
      },
      {
        headers: {
          'X-Space': spaceSlug,
        },
      }
    )
    return NextResponse.json(events)
  }
)

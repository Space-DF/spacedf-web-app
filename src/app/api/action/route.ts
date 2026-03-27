import { DEFAULT_PAGE_SIZE } from '@/constants'
import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { NextRequest, NextResponse } from 'next/server'

export const GET = withAuthApiRequired(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const limit = searchParams.get('limit') || DEFAULT_PAGE_SIZE
  const offset = searchParams.get('offset') || 0
  const search = searchParams.get('search') || ''
  const spaceSlug = searchParams.get('spaceSlug') || ''
  try {
    const client = await spaceClient()
    const actions = await client.telemetry.actions.list(
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
    return NextResponse.json(actions)
  } catch (error) {
    return handleError(error)
  }
})

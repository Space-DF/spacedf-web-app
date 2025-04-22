import { auth } from '@/lib/auth'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import memoize from 'memoize'

import { NextRequest, NextResponse } from 'next/server'

const MAX_AGE = 1000 * 60 * 60 * 24
const switchSpaces = memoize(
  async (refreshToken: string, spaceSlugName: string) => {
    const client = await spaceClient()
    return client.auth.switchSpaces({
      space_slug_name: spaceSlugName,
      refresh: refreshToken,
    })
  },
  {
    maxAge: MAX_AGE,
    cacheKey(arguments_) {
      return arguments_.join(',')
    },
  }
)

export const POST = async (request: NextRequest) => {
  try {
    const body: { spaceSlug: string } = await request.json()
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        {
          message: 'Unauthorized',
        },
        {
          status: 401,
        }
      )
    }

    const response = await switchSpaces(session.user.refresh, body.spaceSlug)

    return NextResponse.json(response)
  } catch (error) {
    return handleError(error)
  }
}

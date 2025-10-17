import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { deviceSpaces as dummyDevice } from '@/data/dummy-data'
import { auth } from '@/lib/auth'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { isDemoSubdomain } from '@/utils/server-actions'
import { NextRequest, NextResponse } from 'next/server'

const GET = async (
  request: NextRequest,
  { params }: { params: { spaceSlug: string; limit: string; offset: string } }
) => {
  const { limit = 10, offset = 0, spaceSlug } = params
  try {
    const session = await auth()
    if (!session || !spaceSlug)
      return NextResponse.json([dummyDevice[0]], {
        status: 200,
      })
    const isDemo = await isDemoSubdomain(request)
    if (isDemo) {
      return NextResponse.json(dummyDevice, {
        status: 200,
      })
    }
    const client = await spaceClient()
    client.setAccessToken(session.user.access)
    const devices = await client.deviceSpaces.list(
      { include_latest_checkpoint: true, offset: +offset, limit: +limit },
      {
        headers: {
          'X-Space': spaceSlug,
        },
      }
    )
    return NextResponse.json(devices.results, {
      status: 200,
    })
  } catch (errors) {
    return handleError(errors)
  }
}

export const POST = withAuthApiRequired(
  async (request, { params }: { params: { spaceSlug: string } }) => {
    try {
      const body = await request.json()
      const client = await spaceClient()
      const device = await client.deviceSpaces.create(body, {
        headers: {
          'X-Space': params.spaceSlug,
        },
      })
      return NextResponse.json(device)
    } catch (error) {
      return handleError(error)
    }
  }
)

export { GET }

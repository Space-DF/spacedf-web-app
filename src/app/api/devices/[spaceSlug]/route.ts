import { deviceSpaces as dummyDevice } from '@/data/dummy-data'
import { auth } from '@/lib/auth'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { isDemoSubdomain } from '@/utils/server-actions'
import { NextRequest, NextResponse } from 'next/server'

const GET = async (
  request: NextRequest,
  { params }: { params: { spaceSlug: string } }
) => {
  try {
    const session = await auth()
    if (!session || !params.spaceSlug)
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
      { include_latest_checkpoint: true },
      {
        headers: {
          'X-Space': params.spaceSlug,
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

export { GET }

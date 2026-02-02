import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { deviceSpaces as dummyDevice } from '@/data/dummy-data'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { isDemoSubdomain, readSession } from '@/utils/server-actions'
import { NextRequest, NextResponse } from 'next/server'

const GET = async (
  request: NextRequest,
  { params }: { params: { spaceSlug: string } }
) => {
  const { spaceSlug } = params
  const searchParams = request.nextUrl.searchParams
  const limit = searchParams.get('limit') || '10'
  const offset = searchParams.get('offset') || '0'
  const search = searchParams.get('search') || ''
  try {
    const session = await readSession()
    if (!session || !spaceSlug)
      return NextResponse.json([dummyDevice[0]], {
        status: 200,
      })
    const isDemo = await isDemoSubdomain(request)
    if (isDemo) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const dummyResults = dummyDevice.filter((device) =>
        device.name.toLowerCase().includes(search.toLowerCase().trim())
      )
      return NextResponse.json(dummyResults, {
        status: 200,
      })
    }
    const client = await spaceClient()
    client.setAccessToken(session?.user?.access as string)
    const devices = await client.deviceSpaces.list(
      {
        include_latest_checkpoint: true,
        offset: +offset,
        limit: +limit,
        search,
      },
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

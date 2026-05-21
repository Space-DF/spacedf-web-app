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
  const bbox = searchParams.get('bbox') || ''
  const device_id = searchParams.get('device_id') || ''
  const buildingId = searchParams.get('buildingId') || ''
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
    const params = {
      include_latest_checkpoint: true,
      offset: +offset,
      limit: +limit,
      search,
      bbox,
      device_id,
      building_id: buildingId,
    }
    const devices = await client.deviceSpaces.list(params, {
      headers: {
        'X-Space': spaceSlug,
      },
    })

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

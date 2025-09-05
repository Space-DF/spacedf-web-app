import { dummyTrips } from '@/data/dummy-data'
import { auth } from '@/lib/auth'
import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { isDemoSubdomain } from '@/utils/server-actions'
import { NextRequest, NextResponse } from 'next/server'

export const GET = withAuthApiRequired(
  async (
    request: NextRequest,
    { params }: { params: { deviceId: string; spaceSlug: string } }
  ) => {
    const { deviceId, spaceSlug } = params
    const isDemo = await isDemoSubdomain(request)

    if (isDemo) {
      console.log({ deviceId, dummyTrips })
      const trips = dummyTrips.filter((trip) => trip.space_device === deviceId)
      return NextResponse.json(trips, {
        status: 200,
      })
    }
    try {
      const session = await auth()
      if (!session) return NextResponse.json([])
      const client = await spaceClient()
      const trips = await client.trip.list(
        {
          space_device__device_id: deviceId,
          include_checkpoints: true,
        },
        {
          headers: {
            'X-Space': spaceSlug,
          },
        }
      )
      return NextResponse.json(trips.results)
    } catch (error) {
      return handleError(error)
    }
  }
)

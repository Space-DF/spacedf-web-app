import { dummyTrips } from '@/data/dummy-data'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { isDemoSubdomain, readSession } from '@/utils/server-actions'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (
  request: NextRequest,
  { params }: { params: { deviceId: string; spaceSlug: string } }
) => {
  const { deviceId, spaceSlug } = params

  try {
    const isDemo = await isDemoSubdomain(request)
    const session = await readSession()
    if (isDemo || !spaceSlug || !session) {
      const trips = dummyTrips.filter((trip) => trip.device_id === deviceId)
      return NextResponse.json(trips, {
        status: 200,
      })
    }

    const client = await spaceClient()
    client.setAccessToken(session?.user?.access as string)
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

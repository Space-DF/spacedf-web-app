import { spaceClient } from '@/lib/spacedf'
import { Trip } from '@/types/trip'
import { handleError } from '@/utils/error'
import { isDemoSubdomain, readSession } from '@/utils/server-actions'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (
  request: NextRequest,
  { params }: { params: { deviceId: string } }
) => {
  try {
    const spaceSlug = request.nextUrl.searchParams.get('spaceSlug')
    const { deviceId } = params
    const isDemo = await isDemoSubdomain(request)
    const session = await readSession()
    if (isDemo || !session) {
      return NextResponse.json([])
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
    const latestTrip = trips.results[0] as unknown as Trip
    if (!latestTrip) {
      return NextResponse.json([])
    }
    const tripDetail = (await client.trip.retrieve(
      latestTrip.id,
      {
        include_checkpoints: true,
      },
      {
        headers: {
          'X-Space': spaceSlug,
        },
      }
    )) as unknown as Trip
    return NextResponse.json(tripDetail.checkpoints)
  } catch (error) {
    return handleError(error)
  }
}

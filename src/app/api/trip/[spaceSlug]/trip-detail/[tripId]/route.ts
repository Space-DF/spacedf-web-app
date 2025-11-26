import { dummyTrips } from '@/data/dummy-data'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { isDemoSubdomain, readSession } from '@/utils/server-actions'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (
  request: NextRequest,
  { params }: { params: { tripId: string; spaceSlug: string } }
) => {
  try {
    const { tripId, spaceSlug } = params
    const isDemo = await isDemoSubdomain(request)
    const session = await readSession()
    if (isDemo || !session) {
      return NextResponse.json(dummyTrips.find((trip) => trip.id === tripId))
    }
    const client = await spaceClient()
    client.setAccessToken(session?.user?.access as string)
    const trip = await client.trip.retrieve(
      tripId,
      {
        include_checkpoints: true,
      },
      {
        headers: {
          'X-Space': spaceSlug,
        },
      }
    )
    return NextResponse.json(trip)
  } catch (error) {
    return handleError(error)
  }
}

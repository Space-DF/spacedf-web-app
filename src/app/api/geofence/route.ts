import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { NextRequest, NextResponse } from 'next/server'

export const POST = withAuthApiRequired(async (request: NextRequest) => {
  try {
    const geofence = await request.json()
    const spaceSlug = request.nextUrl.searchParams.get('spaceSlug') || ''
    const spacedfClient = await spaceClient()
    const newGeofence = await spacedfClient.telemetry.geofences.create(
      geofence,
      {
        headers: {
          'X-Space': spaceSlug,
        },
      }
    )
    return NextResponse.json(newGeofence)
  } catch (error) {
    return handleError(error)
  }
})

export const GET = withAuthApiRequired(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const limit = searchParams.get('limit') || 10
  const offset = searchParams.get('offset') || 0
  const search = searchParams.get('search') || ''
  const spaceSlug = searchParams.get('spaceSlug') || ''
  try {
    const spacedfClient = await spaceClient()
    const geofences = await spacedfClient.telemetry.geofences.list(
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
    return NextResponse.json(geofences)
  } catch (error) {
    return handleError(error)
  }
})

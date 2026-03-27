import { DEFAULT_PAGE_SIZE } from '@/constants'
import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { Geofence } from '@/types/geofence'
import { PaginationResponse } from '@/types/global'
import { handleError } from '@/utils/error'
import { isDemoSubdomain } from '@/utils/server-actions'
import { NextRequest, NextResponse } from 'next/server'
import { dummyGeofences } from '@/data/dummy-data'
export const POST = withAuthApiRequired(async (request: NextRequest) => {
  try {
    const geofence = await request.json()
    const isDemo = await isDemoSubdomain(request)
    if (isDemo) {
      return NextResponse.json(geofence)
    }
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
  const limit = searchParams.get('limit') || DEFAULT_PAGE_SIZE
  const offset = searchParams.get('offset') || 0
  const search = searchParams.get('search') || ''
  const spaceSlug = searchParams.get('spaceSlug') || ''
  const bbox = searchParams.get('bbox') || ''

  try {
    const isDemo = await isDemoSubdomain(request)
    if (isDemo) {
      const normalizedSearch = search.trim().toLowerCase()
      const filtered = normalizedSearch
        ? dummyGeofences.filter((item) =>
            item.name.toLowerCase().includes(normalizedSearch)
          )
        : dummyGeofences
      const start = +offset
      const end = start + +limit
      const paginated: PaginationResponse<Geofence> = {
        count: filtered.length,
        next: end < filtered.length ? String(end) : undefined,
        previous: start > 0 ? String(Math.max(0, start - +limit)) : undefined,
        results: filtered.slice(start, end) as unknown as Geofence[],
      }
      return NextResponse.json(paginated)
    }

    const spacedfClient = await spaceClient()
    const geofences = await spacedfClient.telemetry.geofences.list(
      {
        limit: +limit,
        offset: +offset,
        search,
        bbox,
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

import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { isDemoSubdomain } from '@/utils/server-actions'
import { NextRequest, NextResponse } from 'next/server'

export const DELETE = withAuthApiRequired(
  async (request: NextRequest, props: { params: Promise<{ id: string }> }) => {
    const params = await props.params
    try {
      const isDemo = await isDemoSubdomain(request)
      if (isDemo) {
        return NextResponse.json({ success: true })
      }
      const geofenceId = params.id
      const spaceSlug = request.nextUrl.searchParams.get('spaceSlug') || ''
      const spacedfClient = await spaceClient()
      await spacedfClient.telemetry.geofences.delete(geofenceId, {
        headers: {
          'X-Space': spaceSlug,
        },
      })
      return NextResponse.json({ success: true })
    } catch (error) {
      return handleError(error)
    }
  }
)

export const PATCH = withAuthApiRequired(
  async (request: NextRequest, props: { params: Promise<{ id: string }> }) => {
    const params = await props.params
    try {
      const isDemo = await isDemoSubdomain(request)
      if (isDemo) {
        return NextResponse.json({ success: true })
      }
      const geofenceId = params.id
      const spaceSlug = request.nextUrl.searchParams.get('spaceSlug') || ''
      const geofence = await request.json()
      const spacedfClient = await spaceClient()
      await spacedfClient.telemetry.geofences.update(geofenceId, geofence, {
        headers: {
          'X-Space': spaceSlug,
        },
      })
      return NextResponse.json({ success: true })
    } catch (error) {
      return handleError(error)
    }
  }
)

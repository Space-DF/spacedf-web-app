import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { NextRequest, NextResponse } from 'next/server'

export const DELETE = withAuthApiRequired(
  async (
    _: NextRequest,
    { params }: { params: { id: number; spaceSlug: string } }
  ) => {
    try {
      const spacedfClient = await spaceClient()
      const dashboard = await spacedfClient.dashboards.delete(params.id, {
        headers: {
          'X-Space': params.spaceSlug,
        },
      })
      return NextResponse.json(dashboard)
    } catch (error) {
      return handleError(error)
    }
  }
)

export const PATCH = withAuthApiRequired(
  async (req, { params }: { params: { spaceSlug: string; id: number } }) => {
    try {
      const body = await req.json()
      const spacedfClient = await spaceClient()
      const dashboard = await spacedfClient.dashboards.update(params.id, body, {
        headers: {
          'X-Space': params.spaceSlug,
        },
      })
      return NextResponse.json(dashboard)
    } catch (error) {
      return handleError(error)
    }
  }
)

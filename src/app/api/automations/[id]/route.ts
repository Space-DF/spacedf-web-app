import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { NextRequest, NextResponse } from 'next/server'

export const GET = withAuthApiRequired(
  async (request: NextRequest, props: { params: Promise<{ id: string }> }) => {
    const params = await props.params
    const spaceSlug = request.nextUrl.searchParams.get('spaceSlug') || ''

    try {
      const spacedfClient = await spaceClient()
      const automation = await spacedfClient.telemetry.automations.retrieve(
        params.id,
        {
          headers: {
            'X-Space': spaceSlug,
          },
        }
      )
      return NextResponse.json(automation)
    } catch (error) {
      return handleError(error)
    }
  }
)

export const PATCH = withAuthApiRequired(
  async (request: NextRequest, props: { params: Promise<{ id: string }> }) => {
    const params = await props.params
    const spaceSlug = request.nextUrl.searchParams.get('spaceSlug') || ''

    try {
      const body = await request.json()
      const spacedfClient = await spaceClient()
      const automation = await spacedfClient.telemetry.automations.update(
        params.id,
        body,
        {
          headers: {
            'X-Space': spaceSlug,
          },
        }
      )
      return NextResponse.json(automation)
    } catch (error) {
      return handleError(error)
    }
  }
)

export const DELETE = withAuthApiRequired(
  async (request: NextRequest, props: { params: Promise<{ id: string }> }) => {
    const params = await props.params
    const spaceSlug = request.nextUrl.searchParams.get('spaceSlug') || ''

    try {
      const spacedfClient = await spaceClient()
      await spacedfClient.telemetry.automations.delete(params.id, {
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

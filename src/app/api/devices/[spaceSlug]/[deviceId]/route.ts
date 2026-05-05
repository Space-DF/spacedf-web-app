import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { NextResponse } from 'next/server'

export const DELETE = withAuthApiRequired(
  async (
    _,
    { params }: { params: { spaceSlug: string; deviceId: string } }
  ) => {
    const { spaceSlug, deviceId } = params
    try {
      const client = await spaceClient()
      await client.deviceSpaces.delete(deviceId, {
        headers: {
          'X-Space': spaceSlug,
        },
      })
      return NextResponse.json({
        status: 204,
      })
    } catch (error) {
      return handleError(error)
    }
  }
)

export const GET = withAuthApiRequired(
  async (
    _,
    { params }: { params: { spaceSlug: string; deviceId: string } }
  ) => {
    const { spaceSlug, deviceId } = params
    const client = await spaceClient()
    const device = await client.deviceSpaces.retrieveByDeviceId(deviceId, {
      headers: {
        'X-Space': spaceSlug,
      },
    })
    return NextResponse.json(device)
  }
)

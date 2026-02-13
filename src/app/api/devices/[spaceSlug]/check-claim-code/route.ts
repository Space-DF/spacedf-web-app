import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { NextRequest, NextResponse } from 'next/server'

export const POST = withAuthApiRequired(
  async (req: NextRequest, { params }: { params: { spaceSlug: string } }) => {
    try {
      const body = await req.json()
      const { code } = body
      const client = await spaceClient()
      const response = await client.device.checkClaimCode(code, {
        headers: {
          'X-Space': params.spaceSlug,
        },
      })
      return NextResponse.json(response)
    } catch (error) {
      return handleError(error)
    }
  }
)

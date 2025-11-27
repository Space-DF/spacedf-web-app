import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { NextResponse } from 'next/server'

export const PUT = withAuthApiRequired(
  async (req, { params }: { params: { spaceSlug: string } }) => {
    try {
      const body = await req.json()
      const spacedfClient = await spaceClient()
      const response = await spacedfClient.widgets.updateWidgets(body, {
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

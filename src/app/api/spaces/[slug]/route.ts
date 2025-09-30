// pages/api/submit-form.ts
import { NextResponse } from 'next/server'

import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { isDemoSubdomain } from '@/utils/server-actions'
import { DEMO_SPACE } from '@/constants'

const GET = withAuthApiRequired(
  async (req, { params }: { params: { slug: string } }) => {
    const isDemo = await isDemoSubdomain(req)
    if (isDemo) {
      return NextResponse.json({
        data: DEMO_SPACE,
        status: 200,
      })
    }
    const spacedfClient = await spaceClient()

    try {
      const spaceListResponse = await spacedfClient.spaces.list({
        headers: {
          'X-Space': params.slug,
        },
      })

      return NextResponse.json({
        data: spaceListResponse,
        status: 200,
      })
    } catch (errors) {
      return handleError(errors)
    }
  }
)

const DELETE = withAuthApiRequired(
  async (_, { params }: { params: { slug: string } }) => {
    try {
      const spacedfClient = await spaceClient()
      const deleteSpaceResponse = await spacedfClient.spaces.delete({
        'X-Space': params.slug,
      })
      return NextResponse.json({
        data: deleteSpaceResponse,
        status: 200,
      })
    } catch (errors) {
      return handleError(errors)
    }
  }
)

export { GET, DELETE }

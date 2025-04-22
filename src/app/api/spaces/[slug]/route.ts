// pages/api/submit-form.ts
import { NextResponse } from 'next/server'

import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'

const GET = withAuthApiRequired(
  async (req, { params }: { params: { slug: string } }) => {
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

const DELETE = withAuthApiRequired(async (req) => {
  const body = await req.json()
  const spacedfClient = await spaceClient()

  try {
    const deleteSpaceResponse = await spacedfClient.spaces.delete(body)
    return NextResponse.json({
      data: deleteSpaceResponse,
      status: 200,
    })
  } catch (errors) {
    return handleError(errors)
  }
})

export { GET, DELETE }

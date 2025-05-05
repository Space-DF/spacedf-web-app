// pages/api/submit-form.ts
import { NextResponse } from 'next/server'

import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'

const GET = withAuthApiRequired(
  async (_, { params }: { params: { slug: string } }) => {
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
  try {
    const body = await req.json()
    const { slug_name } = body
    const spacedfClient = await spaceClient()
    const deleteSpaceResponse = await spacedfClient.spaces.delete({
      headers: {
        'X-Space': slug_name,
      },
    })
    return NextResponse.json({
      data: deleteSpaceResponse,
      status: 200,
    })
  } catch (errors) {
    console.log(errors)
    return handleError(errors)
  }
})

export { GET, DELETE }

// pages/api/submit-form.ts
import { NextResponse } from 'next/server'

import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'

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
    } catch (errors: any) {
      return NextResponse.json(
        {
          ...(errors?.error || {}),
        },
        {
          status: errors.status,
        },
      )
    }
  },
)

const DELETE = withAuthApiRequired(
  async (req, { params }: { params: { slug: string } }) => {
    const body = await req.json()
    const spacedfClient = await spaceClient()

    try {
      // console.log(body)
      const deleteSpaceResponse = await spacedfClient.spaces.delete(body, {
        headers: {
          'X-Space': params.slug,
        },
      })
      return NextResponse.json({
        data: deleteSpaceResponse,
        status: 200,
      })
    } catch (errors: any) {
      return NextResponse.json(
        {
          ...(errors?.error || {}),
        },
        {
          status: errors.status,
        },
      )
    }
  },
)

export { GET, DELETE }

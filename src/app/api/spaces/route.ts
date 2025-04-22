// pages/api/submit-form.ts
import { NextResponse } from 'next/server'

import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'

const GET = withAuthApiRequired(async () => {
  const spacedfClient = await spaceClient()

  try {
    const spaceListResponse = await spacedfClient.spaces.list()

    return NextResponse.json({
      data: spaceListResponse,
      status: 200,
    })
  } catch (errors: any) {
    return handleError(errors)
  }
})

const POST = withAuthApiRequired(async (req) => {
  const body = await req.json()
  const spacedfClient = await spaceClient()

  try {
    const createSpaceResponse = await spacedfClient.spaces.create(body)

    return NextResponse.json({
      data: createSpaceResponse,
      status: 200,
    })
  } catch (errors: any) {
    return NextResponse.json(
      {
        ...(errors?.error || {}),
      },
      {
        status: errors.status,
      }
    )
  }
})

const PATCH = withAuthApiRequired(async (req) => {
  const body = await req.json()
  const spacedfClient = await spaceClient()

  const { searchParams } = new URL(req.url)

  const space_slug = searchParams.get('slug_name')

  try {
    const updatedSpaceResponse = await spacedfClient.spaces.update({
      ...body,
      'X-Space': space_slug,
    })
    return NextResponse.json(
      {
        data: updatedSpaceResponse,
        status: 200,
      },
      {
        status: 200,
      }
    )
  } catch (errors: any) {
    return NextResponse.json(
      {
        ...(errors?.error || {}),
      },
      {
        status: errors.status,
      }
    )
  }
})

const DELETE = withAuthApiRequired(async (req) => {
  const body = await req.json()
  const spacedfClient = await spaceClient()

  const { searchParams } = new URL(req.url)

  const space_slug = searchParams.get('slug_name')

  try {
    const deleteSpaceResponse = await spacedfClient.spaces.delete({
      ...body,
      'X-Space': space_slug,
    })
    return NextResponse.json(
      {
        data: deleteSpaceResponse,
        status: 200,
      },
      {
        status: 200,
      }
    )
  } catch (errors: any) {
    return NextResponse.json(
      {
        ...(errors?.error || {}),
      },
      {
        status: errors.status,
      }
    )
  }
})

export { DELETE, GET, PATCH, POST }

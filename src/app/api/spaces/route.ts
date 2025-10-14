// pages/api/submit-form.ts
import { NextRequest, NextResponse } from 'next/server'

import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { isDemoSubdomain } from '@/utils/server-actions'
import { DEMO_SPACE } from '@/constants'

const GET = withAuthApiRequired(async (req: NextRequest) => {
  const spacedfClient = await spaceClient()
  const isDemo = await isDemoSubdomain(req)
  if (isDemo) {
    return NextResponse.json({
      data: DEMO_SPACE,
      status: 200,
    })
  }
  try {
    const spaceListResponse = await spacedfClient.spaces.list()

    return NextResponse.json({
      data: spaceListResponse,
      status: 200,
    })
  } catch (errors) {
    return handleError(errors)
  }
})

const POST = withAuthApiRequired(async (req) => {
  try {
    const isDemo = await isDemoSubdomain(req)
    if (isDemo) {
      return NextResponse.json({})
    }
    const formData = await req.formData()
    let logo: string | undefined = undefined
    const file = formData.get('logo') as File
    if (!file || typeof file === 'string') {
      return NextResponse.json(
        {
          message: 'Logo is required',
        },
        {
          status: 400,
        }
      )
    }
    const spacedfClient = await spaceClient()
    const data = await spacedfClient.presignedUrl.get()
    const presignedUrl = data.presigned_url
    const fileBuffer = await file.arrayBuffer()
    const responseImage = await fetch(presignedUrl, {
      method: 'PUT',
      body: fileBuffer,
    })
    if (!responseImage.ok) {
      return NextResponse.json({
        message: 'Presigned url is not valid',
        status: 400,
      })
    }
    logo = data.file_name
    const name = formData.get('name') as string
    const slug_name = formData.get('slug_name') as string
    const createSpaceResponse = await spacedfClient.spaces.create({
      logo: logo as string,
      name,
      slug_name,
    })

    return NextResponse.json({
      data: createSpaceResponse,
      status: 200,
    })
  } catch (errors) {
    return handleError(errors)
  }
})

const PATCH = withAuthApiRequired(async (req) => {
  const formData = await req.formData()
  const logo = formData.get('logo') as File
  const name = formData.get('name')
  const description = formData.get('description')

  let logoUrl = undefined

  const spacedfClient = await spaceClient()
  if (logo && typeof logo !== 'string') {
    const data = await spacedfClient.presignedUrl.get()
    const presignedUrl = data.presigned_url
    const fileBuffer = await logo.arrayBuffer()
    const responseImage = await fetch(presignedUrl, {
      method: 'PUT',
      body: fileBuffer,
    })
    if (!responseImage.ok) {
      return NextResponse.json({
        message: 'Presigned url is not valid',
        status: 400,
      })
    }

    logoUrl = data.file_name
  }

  const { searchParams } = new URL(req.url)

  const space_slug = searchParams.get('slug_name') as string
  try {
    const space = {
      name: name as string,
      description: description as string,
      logo: logoUrl as string,
    }

    const updatedSpaceResponse = await spacedfClient.spaces.partialUpdate({
      ...space,
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
  } catch (errors) {
    return handleError(errors)
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
  } catch (errors) {
    return handleError(errors)
  }
})

export { DELETE, GET, PATCH, POST }

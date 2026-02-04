import { NextRequest, NextResponse } from 'next/server'
import { spaceClient } from '@/lib/spacedf'
import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { handleError } from '@/utils/error'
import { isDemoSubdomain } from '@/utils/server-actions'
import { DEMO_USER } from '@/constants'

export const POST = withAuthApiRequired(async (request: Request) => {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    if (!file)
      return NextResponse.json(
        { message: 'Image is required' },
        { status: 400 }
      )
    const spacedfClient = await spaceClient()
    const data = await spacedfClient.presignedUrl.get()
    const presignedUrl = data.presigned_url
    const fileBuffer = await file.arrayBuffer()

    const responseImage = await fetch(presignedUrl, {
      method: 'PUT',
      body: fileBuffer,
    })
    if (!responseImage.ok) {
      return NextResponse.json(
        { message: 'Presigned url is not valid' },
        { status: 400 }
      )
    }
    const newImageUrl = presignedUrl.split('?')[0]
    return NextResponse.json({
      ...data,
      presigned_url: newImageUrl,
    })
  } catch (error) {
    return handleError(error)
  }
})

export const GET = withAuthApiRequired(async (req: NextRequest) => {
  try {
    const isDemo = await isDemoSubdomain(req)
    if (isDemo) {
      return NextResponse.json(DEMO_USER)
    }
    const spacedfClient = await spaceClient()
    const response = await spacedfClient.users.getMe()
    return NextResponse.json(response)
  } catch (error) {
    return handleError(error)
  }
})

export const PUT = withAuthApiRequired(async (request: NextRequest) => {
  try {
    const isDemo = await isDemoSubdomain(request)
    if (isDemo) {
      return NextResponse.json(DEMO_USER)
    }
    const spacedfClient = await spaceClient()
    const formData = await request.formData()
    let avatar = undefined as string | undefined
    const file = formData.get('avatar') as File
    if (file && typeof file !== 'string') {
      const data = await spacedfClient.presignedUrl.get()
      const presignedUrl = data.presigned_url
      const fileBuffer = await file.arrayBuffer()
      const responseImage = await fetch(presignedUrl, {
        method: 'PUT',
        body: fileBuffer,
      })
      if (!responseImage.ok) {
        return NextResponse.json(
          { message: 'Presigned url is not valid' },
          { status: 400 }
        )
      }
      avatar = data.file_name
    }
    const first_name = formData.get('first_name') as string
    const last_name = formData.get('last_name') as string
    const company_name = formData.get('company_name') as string
    const location = formData.get('location') as string
    const title = formData.get('title') as string

    const response = await spacedfClient.users.updateMe({
      avatar,
      first_name,
      last_name,
      company_name,
      location,
      title,
    })
    return NextResponse.json(response)
  } catch (error) {
    return handleError(error)
  }
})

export const DELETE = withAuthApiRequired(async (request: NextRequest) => {
  try {
    const isDemo = await isDemoSubdomain(request)
    if (isDemo) {
      return NextResponse.json({})
    }
    const spacedfClient = await spaceClient()
    const response = await spacedfClient.users.deleteMe()
    return NextResponse.json(response)
  } catch (error) {
    return handleError(error)
  }
})

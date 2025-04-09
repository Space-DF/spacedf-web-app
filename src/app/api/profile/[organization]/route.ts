import { ApiErrorResponse } from '@/types/global'
import { Profile } from '@/types/profile'
import { NextResponse } from 'next/server'
import { spaceClient } from '@/lib/spacedf'
import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'

export const POST = withAuthApiRequired(async (request: Request) => {
  const formData = await request.formData()
  const file = formData.get('image') as File
  if (!file)
    return NextResponse.json({ message: 'Image is required' }, { status: 400 })
  try {
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
    const errorResponse = error as ApiErrorResponse
    return NextResponse.json(
      {
        message: errorResponse.detail || 'Something went wrong',
      },
      { status: errorResponse.code || 400 }
    )
  }
})

export const GET = withAuthApiRequired(async () => {
  try {
    const spacedfClient = await spaceClient()
    const response = await spacedfClient.users.getMe()
    return NextResponse.json(response)
  } catch (error) {
    const errorResponse = error as ApiErrorResponse
    return NextResponse.json(
      {
        message: errorResponse.detail || 'Something went wrong',
      },
      { status: errorResponse.code || 400 }
    )
  }
})

export const PUT = withAuthApiRequired(async (request: Request) => {
  const body: Omit<Profile, 'id'> = await request.json()
  const spacedfClient = await spaceClient()
  try {
    const response = await spacedfClient.users.updateMe(body)
    return NextResponse.json(response)
  } catch (error) {
    const errorResponse = error as ApiErrorResponse
    return NextResponse.json(
      {
        message: errorResponse.detail || 'Something went wrong',
      },
      { status: errorResponse.code || 400 }
    )
  }
})

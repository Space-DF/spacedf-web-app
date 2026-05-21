import { DEFAULT_PAGE_SIZE } from '@/constants'
import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { NextRequest, NextResponse } from 'next/server'

export const POST = withAuthApiRequired(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const spaceSlug = searchParams.get('spaceSlug')
  const formData = await request.formData()
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const file = formData.get('model') as File
  if (!file) {
    return NextResponse.json({ message: 'File is required' }, { status: 400 })
  }
  const spacedfClient = await spaceClient()
  const data = await spacedfClient.presignedUrl.get()
  const presignedUrl = data.presigned_url
  const fileBuffer = await file.arrayBuffer()
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: fileBuffer,
  })
  if (!response.ok) {
    return NextResponse.json(
      { message: 'Failed to upload file' },
      { status: 400 }
    )
  }
  const facility = await spacedfClient.facilities.create(
    {
      name,
      description,
      location: {} as any,
      scene_asset: data.file_name,
    },
    {
      headers: {
        'X-Space': spaceSlug,
      },
    }
  )
  return NextResponse.json(facility)
})

export const GET = withAuthApiRequired(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const spaceSlug = searchParams.get('spaceSlug')
  const limit = searchParams.get('limit') || DEFAULT_PAGE_SIZE
  const offset = searchParams.get('offset') || 0
  const spacedfClient = await spaceClient()
  const facilities = await spacedfClient.facilities.list(
    {
      limit: +limit,
      offset: +offset,
    },
    {
      headers: {
        'X-Space': spaceSlug,
      },
    }
  )
  return NextResponse.json(facilities)
})

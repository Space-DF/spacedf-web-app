import { DEFAULT_PAGE_SIZE } from '@/constants'
import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { NextRequest, NextResponse } from 'next/server'

export const POST = withAuthApiRequired(async (request: NextRequest) => {
  const formData = await request.formData()
  const spacedfClient = await spaceClient()
  const searchParams = request.nextUrl.searchParams
  const spaceSlug = searchParams.get('spaceSlug')
  const file = formData.get('model') as File | null
  const name = formData.get('name') as string
  if (!file || !spaceSlug) {
    return NextResponse.json(
      { message: 'File and space slug are required' },
      { status: 400 }
    )
  }
  const data = await spacedfClient.presignedUrl.get()
  const presignedUrl = data.presigned_url
  const fileBuffer = await file.arrayBuffer()
  const responseModel = await fetch(presignedUrl, {
    method: 'PUT',
    body: fileBuffer,
  })
  if (!responseModel.ok) {
    return NextResponse.json(
      { message: 'Presigned url is not valid' },
      { status: 400 }
    )
  }

  const body = {
    name,
    description: '',
    location: {},
    scene_asset: data.file_name,
  }

  const newBuilding = await spacedfClient.buildings.create(body, {
    headers: {
      'X-Space': spaceSlug,
    },
  })

  return NextResponse.json(newBuilding)
})

export const GET = withAuthApiRequired(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const spaceSlug = searchParams.get('spaceSlug')
  const limit = searchParams.get('limit') || DEFAULT_PAGE_SIZE
  const offset = searchParams.get('offset') || 0
  const spacedfClient = await spaceClient()
  const buildings = await spacedfClient.buildings.list(
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
  return NextResponse.json(buildings)
})

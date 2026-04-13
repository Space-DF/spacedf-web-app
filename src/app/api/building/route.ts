import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { NextRequest, NextResponse } from 'next/server'

export const POST = withAuthApiRequired(async (request: NextRequest) => {
  const formData = await request.formData()
  const spacedfClient = await spaceClient()
  const searchParams = request.nextUrl.searchParams
  const spaceSlug = searchParams.get('spaceSlug')
  const file = formData.get('model') as File | null
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
  const updateSpaceData = {
    build_artifact: data.file_name,
    'X-Space': spaceSlug,
  } as any
  await spacedfClient.spaces.partialUpdate(updateSpaceData)
  return NextResponse.json({
    success: true,
    build_artifact: data.file_name,
  })
})

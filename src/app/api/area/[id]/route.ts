import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { NextRequest, NextResponse } from 'next/server'

export const PATCH = withAuthApiRequired(
  async (request: NextRequest, props: { params: Promise<{ id: string }> }) => {
    const params = await props.params
    const { id } = params
    const searchParams = request.nextUrl.searchParams
    const spaceSlug = searchParams.get('spaceSlug')
    const contentType = request.headers.get('content-type') ?? ''
    const spacedfClient = await spaceClient()

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const name = formData.get('name') as string
      const file = formData.get('model') as File | null

      let sceneAsset: string | undefined

      if (file) {
        const data = await spacedfClient.presignedUrl.get()
        const fileBuffer = await file.arrayBuffer()
        const uploadResponse = await fetch(data.presigned_url, {
          method: 'PUT',
          body: fileBuffer,
        })
        if (!uploadResponse.ok) {
          return NextResponse.json(
            { message: 'Failed to upload model file' },
            { status: 400 }
          )
        }
        sceneAsset = data.file_name
      }

      const facility = await spacedfClient.facilities.partialUpdate(
        id,
        {
          name,
          ...(sceneAsset ? { scene_asset: sceneAsset } : {}),
        } as Parameters<typeof spacedfClient.facilities.partialUpdate>[1],
        { headers: { 'X-Space': spaceSlug } }
      )
      return NextResponse.json(facility)
    }

    const body = await request.json()
    const facility = await spacedfClient.facilities.partialUpdate(id, body, {
      headers: { 'X-Space': spaceSlug },
    })
    return NextResponse.json(facility)
  }
)

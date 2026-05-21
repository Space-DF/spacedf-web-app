import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { NextRequest, NextResponse } from 'next/server'

export const DELETE = withAuthApiRequired(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params
    const searchParams = request.nextUrl.searchParams
    const spaceSlug = searchParams.get('spaceSlug')
    const spacedfClient = await spaceClient()
    await spacedfClient.floors.delete(id, {
      headers: {
        'X-Space': spaceSlug,
      },
    })
    return NextResponse.json({ success: true })
  }
)

export const PATCH = withAuthApiRequired(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params
    const searchParams = request.nextUrl.searchParams
    const spaceSlug = searchParams.get('spaceSlug')
    const contentType = request.headers.get('content-type') ?? ''

    const spacedfClient = await spaceClient()

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const name = formData.get('name') as string
      const level = Number(formData.get('level') ?? 0)
      const file = formData.get('model') as File | null

      let sceneAsset: string | undefined

      if (file) {
        const data = await spacedfClient.presignedUrl.get()
        const presignedUrl = data.presigned_url
        const fileBuffer = await file.arrayBuffer()
        const uploadResponse = await fetch(presignedUrl, {
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

      const floor = await spacedfClient.floors.partialUpdate(
        id,
        {
          name,
          description: '',
          level,
          ...(sceneAsset ? { scene_asset: sceneAsset } : {}),
        } as Parameters<typeof spacedfClient.floors.partialUpdate>[1],
        {
          headers: {
            'X-Space': spaceSlug,
          },
        }
      )
      return NextResponse.json(floor)
    }

    const body = await request.json()
    const floor = await spacedfClient.floors.partialUpdate(id, body, {
      headers: {
        'X-Space': spaceSlug,
      },
    })
    return NextResponse.json(floor)
  }
)

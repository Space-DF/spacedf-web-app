import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { NextRequest, NextResponse } from 'next/server'

export const DELETE = withAuthApiRequired(
  async (request: NextRequest, props: { params: Promise<{ id: number }> }) => {
    const params = await props.params
    const { id } = params
    const searchParams = request.nextUrl.searchParams
    const spaceSlug = searchParams.get('spaceSlug')
    const spacedfClient = await spaceClient()
    await spacedfClient.buildings.delete(id, {
      headers: {
        'X-Space': spaceSlug,
      },
    })
    return NextResponse.json({ success: true })
  }
)

export const PATCH = withAuthApiRequired(
  async (request: NextRequest, props: { params: Promise<{ id: string }> }) => {
    const params = await props.params
    const { id } = params
    const body = await request.json()
    const searchParams = request.nextUrl.searchParams
    const spaceSlug = searchParams.get('spaceSlug')
    const spacedfClient = await spaceClient()
    const building = await spacedfClient.buildings.partialUpdate(id, body, {
      headers: {
        'X-Space': spaceSlug,
      },
    })
    return NextResponse.json(building)
  }
)

export const PUT = withAuthApiRequired(
  async (request: NextRequest, props: { params: Promise<{ id: string }> }) => {
    const params = await props.params
    const { id } = params
    const searchParams = request.nextUrl.searchParams
    const spaceSlug = searchParams.get('spaceSlug')
    const formData = await request.formData()
    const name = formData.get('name') as string | null
    const file = formData.get('model') as File | null

    if (!spaceSlug || !name?.trim()) {
      return NextResponse.json(
        { message: 'Space slug and name are required' },
        { status: 400 }
      )
    }

    const spacedfClient = await spaceClient()
    const headers = { 'X-Space': spaceSlug } as const
    const trimmedName = name.trim()

    if (file && typeof file !== 'string' && file.size > 0) {
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
        name: trimmedName,
        description: '',
        location: {},
        scene_asset: data.file_name,
      }

      const building = await spacedfClient.buildings.partialUpdate(id, body, {
        headers,
      })
      return NextResponse.json(building)
    }

    const building = await spacedfClient.buildings.partialUpdate(
      id,
      { name: trimmedName },
      { headers }
    )
    return NextResponse.json(building)
  }
)

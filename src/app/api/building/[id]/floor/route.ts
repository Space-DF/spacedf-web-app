import { DEFAULT_PAGE_SIZE } from '@/constants/pagination'
import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { NextRequest, NextResponse } from 'next/server'

export const GET = withAuthApiRequired(
  async (request: NextRequest, { params }: { params: { id: number } }) => {
    const { id } = params
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit') || DEFAULT_PAGE_SIZE
    const offset = searchParams.get('offset') || 0
    const spaceSlug = searchParams.get('spaceSlug')
    const spacedfClient = await spaceClient()
    const floors = await spacedfClient.buildings.listFloors(
      id,
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
    return NextResponse.json(floors)
  }
)

export const POST = withAuthApiRequired(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params
    const searchParams = request.nextUrl.searchParams
    const spaceSlug = searchParams.get('spaceSlug')
    const formData = await request.formData()
    const file = formData.get('model') as File | null
    const name = formData.get('name') as string
    const level = Number(formData.get('level') ?? 0)

    if (!file || !name || !spaceSlug) {
      return NextResponse.json(
        { message: 'File, name, and space slug are required' },
        { status: 400 }
      )
    }

    const spacedfClient = await spaceClient()
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

    const floor = await spacedfClient.buildings.createFloor(
      id,
      {
        name,
        description: '',
        level,
        scene_asset: data.file_name,
      },
      {
        headers: {
          'X-Space': spaceSlug,
        },
      }
    )

    return NextResponse.json(floor)
  }
)

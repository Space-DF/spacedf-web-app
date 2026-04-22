import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { NextRequest, NextResponse } from 'next/server'

export const PATCH = withAuthApiRequired(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
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

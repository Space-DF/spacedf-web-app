import { spaceClient } from '@/lib/spacedf'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (req: NextRequest) => {
  const display_type = req.nextUrl.searchParams.get('type') || undefined
  const search = req.nextUrl.searchParams.get('search') || undefined
  const spaceSlug = req.nextUrl.searchParams.get('spaceSlug')
  const spacedfClient = await spaceClient()
  const entities = await spacedfClient.telemetry.entities.list(
    {
      display_type,
      search,
    },
    {
      headers: {
        'X-Space': spaceSlug,
      },
    }
  )
  return NextResponse.json(entities)
}

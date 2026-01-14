import { NextResponse } from 'next/server'

const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || ''

export async function GET() {
  if (!MAPBOX_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: 'Mapbox token not configured' },
      { status: 500 }
    )
  }

  return NextResponse.json({ mapbox_token: MAPBOX_ACCESS_TOKEN })
}

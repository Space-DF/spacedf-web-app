import { NextResponse } from 'next/server'

const MAPTILER_API_KEY = process.env.MAPTILER_API_KEY || ''

export async function GET() {
  if (!MAPTILER_API_KEY) {
    return NextResponse.json(
      { error: 'MAPTILER_API_KEY not configured' },
      { status: 400 }
    )
  }

  return NextResponse.json({ maptiler_api_key: MAPTILER_API_KEY })
}

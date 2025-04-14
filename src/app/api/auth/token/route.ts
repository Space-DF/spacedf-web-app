import { NextRequest, NextResponse } from 'next/server'

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  try {
    const decoded = JSON.parse(
      Buffer.from(token || '', 'base64').toString('utf-8')
    )
    return NextResponse.json(decoded)
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }
}

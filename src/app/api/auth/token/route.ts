import { NextRequest, NextResponse } from 'next/server'
export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'))
    return NextResponse.json(decoded)
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }
}

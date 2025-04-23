import { NextRequest, NextResponse } from 'next/server'
import { jwtDecode } from 'jwt-decode'
export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }
  try {
    const decoded = jwtDecode(token)
    return NextResponse.json(decoded)
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }
}

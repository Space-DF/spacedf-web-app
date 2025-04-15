// pages/api/submit-form.ts
import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/types/global'
import { spaceClient } from '@/lib/spacedf'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    const client = await spaceClient()
    const data = await client.auth.oauthSendOtp({ email })
    return NextResponse.json(data)
  } catch (err) {
    const { error, status } = (err as ApiResponse) || {}
    return NextResponse.json(
      { message: error?.detail || 'Something went wrong' },
      { status }
    )
  }
}

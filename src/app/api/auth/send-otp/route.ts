// pages/api/submit-form.ts
import { NextRequest, NextResponse } from 'next/server'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    const client = await spaceClient()
    const data = await client.auth.oauthSendOtp({ email })
    return NextResponse.json(data)
  } catch (err) {
    return handleError(err)
  }
}

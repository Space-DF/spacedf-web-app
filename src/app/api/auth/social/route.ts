import { NextRequest, NextResponse } from 'next/server'
import { AUTH_API } from '@/shared/env'
import { handleError } from '@/utils/error'

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json()

    const response = await fetch(`${AUTH_API}/api/console/auth/login/socials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      redirect: 'manual',
    })

    if (response.status === 302) {
      const redirectUrl = response.headers.get('location')
      if (redirectUrl) {
        return NextResponse.json({ redirectUrl })
      }
    }

    return NextResponse.json(
      { error: 'No redirect URL found' },
      { status: 400 }
    )
  } catch (err) {
    return handleError(err)
  }
}

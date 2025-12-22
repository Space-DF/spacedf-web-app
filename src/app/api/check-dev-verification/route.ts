import { NextRequest, NextResponse } from 'next/server'
import { jwtDecrypt } from 'jose'
import * as jose from 'jose'
import { NEXT_PUBLIC_NODE_ENV, SPACEDF_DEV_SECRET } from '@/shared/env'
import { handleError } from '@/utils/error'

export const GET = async (request: NextRequest) => {
  try {
    const isDev = NEXT_PUBLIC_NODE_ENV === 'development'

    if (!isDev) {
      return NextResponse.json({ verified: true })
    }
    const devToken = request.cookies.get('dev-token')

    if (!devToken?.value) {
      return NextResponse.json({ verified: false })
    }

    if (!SPACEDF_DEV_SECRET) {
      return NextResponse.json(
        { verified: false, message: 'Server configuration error' },
        { status: 500 }
      )
    }

    try {
      const secret = jose.base64url.decode(SPACEDF_DEV_SECRET)
      const { payload } = await jwtDecrypt(devToken.value, secret)

      const hasValidToken =
        payload?.hasAccessDev &&
        (!payload?.exp || payload.exp >= Date.now() / 1000)

      if (hasValidToken) {
        return NextResponse.json({
          verified: true,
        })
      } else {
        return NextResponse.json({
          verified: false,
        })
      }
    } catch {
      return NextResponse.json({ verified: false })
    }
  } catch (error) {
    return handleError(error)
  }
}

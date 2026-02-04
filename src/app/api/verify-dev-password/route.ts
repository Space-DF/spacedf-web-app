import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { EncryptJWT, base64url } from 'jose'
import { SPACEDF_DEV_PASSWORD, SPACEDF_DEV_SECRET } from '@/shared/env'
import { handleError } from '@/utils/error'

export const POST = async (request: NextRequest) => {
  try {
    const { password } = await request.json()
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    if (!SPACEDF_DEV_PASSWORD || !SPACEDF_DEV_SECRET) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    if (password !== SPACEDF_DEV_PASSWORD) {
      return NextResponse.json({ error: 'Wrong password' }, { status: 400 })
    }

    const secret = base64url.decode(SPACEDF_DEV_SECRET)
    const devToken = await new EncryptJWT({
      hasAccessDev: true,
    })
      .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
      .setIssuedAt()
      .setIssuer('space-df-dev-token')
      .setAudience('space-df-dev-token')
      .setExpirationTime('2h')
      .encrypt(secret)
    cookies().set('dev-token', devToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 2,
      path: '/',
      sameSite: 'lax',
    })
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
    })
  } catch (error) {
    return handleError(error)
  }
}

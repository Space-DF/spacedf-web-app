import { NextRequest, NextResponse } from 'next/server'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'

export const POST = async (request: NextRequest) => {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    const client = await spaceClient()
    await client.auth.forgetPassword({ token, password })
    return NextResponse.json(
      { message: 'Password reset successful' },
      { status: 200 }
    )
  } catch (error) {
    return handleError(error)
  }
}

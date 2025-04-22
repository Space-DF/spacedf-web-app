import { spaceClient } from '@/lib/spacedf'
import { NextRequest, NextResponse } from 'next/server'
import { handleError } from '@/utils/error'

export const GET = async (req: NextRequest) => {
  try {
    const client = await spaceClient()
    const tokenPair = await client.auth.googleLogin({
      authorization_code: req.nextUrl.searchParams.get('code') || '',
    })
    return NextResponse.json(tokenPair)
  } catch (error) {
    return handleError(error)
  }
}

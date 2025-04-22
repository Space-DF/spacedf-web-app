import { NextRequest, NextResponse } from 'next/server'

import { spaceClient } from '@/lib/spacedf'
import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { handleError } from '@/utils/error'

export const POST = withAuthApiRequired(async (req: NextRequest) => {
  try {
    const { token } = await req.json()
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const spacedfClient = await spaceClient()
    await spacedfClient.spaces.joinSpace(token)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return handleError(error)
  }
})

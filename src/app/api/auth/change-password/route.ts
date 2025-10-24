import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { NextResponse } from 'next/server'

export const PUT = withAuthApiRequired(async (request: Request) => {
  try {
    const { password, new_password } = await request.json()
    const client = await spaceClient()
    await client.auth.changePassword({ password, new_password })
    return NextResponse.json({})
  } catch (error) {
    return handleError(error)
  }
})

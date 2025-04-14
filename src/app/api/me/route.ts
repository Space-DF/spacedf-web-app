import { spaceClient } from '@/lib/spacedf'
import { NextResponse } from 'next/server'
import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { ApiErrorResponse } from '@/types/global'

export const DELETE = withAuthApiRequired(async () => {
  try {
    const spacedfClient = await spaceClient()
    const response = await spacedfClient.users.deleteMe()
    return NextResponse.json(response)
  } catch (error) {
    const errorResponse = error as ApiErrorResponse
    return NextResponse.json(
      {
        message: errorResponse.detail || 'Something went wrong',
      },
      { status: errorResponse.code || 400 }
    )
  }
})

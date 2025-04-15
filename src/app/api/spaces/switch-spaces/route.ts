import { auth } from '@/lib/auth'
import { spaceClient } from '@/lib/spacedf'
import { ApiErrorResponse } from '@/types/global'
import { NextRequest, NextResponse } from 'next/server'

export const POST = async (request: NextRequest) => {
  try {
    const body: { spaceSlug: string } = await request.json()
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        {
          message: 'Unauthorized',
        },
        {
          status: 401,
        }
      )
    }

    const client = await spaceClient()
    const response = await client.auth.switchSpaces({
      space_slug_name: body.spaceSlug,
      refresh: session.user.refresh,
    })

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
}

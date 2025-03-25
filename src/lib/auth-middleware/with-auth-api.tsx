import { ApiErrorResponse } from '@/types/global'
import { NextRequest, NextResponse } from 'next/server'
import { spaceClient } from '../spacedf'

type Handler = (req: NextRequest, options: any) => Promise<NextResponse>

export function withAuthApiRequired(handler: Handler) {
  return async (req: NextRequest, options: any) => {
    try {
      const spacedf = await spaceClient()
      if (!spacedf.accessToken)
        return NextResponse.json<ApiErrorResponse>(
          { detail: 'Unauthorize', code: 401 },
          { status: 401 }
        )
      return await handler(req, options)
    } catch (error) {
      console.error('API Error:', error)
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      )
    }
  }
}

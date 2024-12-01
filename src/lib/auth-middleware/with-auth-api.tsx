import { NextRequest, NextResponse } from 'next/server'
import { SpaceDFClient } from '../spacedf'
import { ApiErrorResponse, ApiResponse } from '@/types/global'

type Handler = (req: NextRequest) => Promise<NextResponse>

export function withAuthApiRequired(handler: Handler) {
  return async (req: NextRequest) => {
    try {
      const spacedf = await SpaceDFClient.getInstance()
      if (!spacedf.getToken())
        return NextResponse.json<ApiErrorResponse>(
          { detail: 'Unauthorize', code: 401 },
          { status: 401 },
        )
      return await handler(req)
    } catch (error) {
      console.error('API Error:', error)
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 },
      )
    }
  }
}

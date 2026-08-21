import { ApiErrorResponse } from '@/types/global'
import { NextRequest, NextResponse } from 'next/server'
import { SpaceDFClient } from '../spacedf'
import { readSession } from '@/utils/server-actions'
import { handleError } from '@/utils/error'

type RouteContext = { params: Promise<any> }

type Handler = (
  req: NextRequest,
  context: RouteContext
) => Promise<NextResponse>

export function withAuthApiRequired(handler: Handler) {
  return async (req: NextRequest, context: RouteContext) => {
    try {
      const session = await readSession()
      const spacedf = await SpaceDFClient.getInstance()
      const accessToken = session?.user?.access
      if (!accessToken)
        return NextResponse.json<ApiErrorResponse>(
          { detail: 'Unauthorize', code: 401 },
          { status: 401 }
        )
      spacedf.setToken(accessToken as string)
      return await handler(req, context)
    } catch (error) {
      return handleError(error)
    }
  }
}

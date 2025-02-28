import { NextRequest, NextResponse } from 'next/server'
import { FetchAPI } from '@/lib/fecth'
import { NEXT_PUBLIC_AUTH_API } from '@/shared/env'
import { ApiErrorResponse, ApiResponse } from '@/types/global'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const ORGANIZATION_ENDPOINT = 'console/api/organizations/check-slug-unique/'

export const POST = async (
  req: NextRequest
): Promise<NextResponse<ApiResponse>> => {
  const body = await req.json()
  const auth = await getServerSession(authOptions)
  try {
    const fetch = new FetchAPI()
    fetch.setURL(NEXT_PUBLIC_AUTH_API)
    const data = await fetch.post(ORGANIZATION_ENDPOINT, body, {
      headers: { Authorization: `Bearer ${auth?.user?.accessToken}` },
    })

    return NextResponse.json({ data, message: 'success', status: 200 })
  } catch (err) {
    console.error(`\x1b[31mFunc: POST - PARAMS: err\x1b[0m`, err)
    const { message, status = 400 } = (err as ApiErrorResponse) || {}
    return NextResponse.json(
      { message: message?.detail || 'Something went wrong', status },
      { status }
    )
  }
}

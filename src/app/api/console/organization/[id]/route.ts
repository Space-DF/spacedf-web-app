import { NextRequest, NextResponse } from 'next/server'
import { FetchAPI } from '@/lib/fecth'
import { NEXT_PUBLIC_AUTH_API } from '@/shared/env'
import { ApiErrorResponse, ApiResponse } from '@/types/global'

const ORGANIZATION_ENDPOINT = 'console/api/organizations'

export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> => {
  const body = await req.json()
  const headers = req.headers || {}
  try {
    const fetch = new FetchAPI()
    fetch.setURL(NEXT_PUBLIC_AUTH_API)
    const data = await fetch.put(
      `${ORGANIZATION_ENDPOINT}/${params.id}/`,
      body,
      {
        headers: {
          Authorization: headers.get('Authorization') || '',
        },
      }
    )

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

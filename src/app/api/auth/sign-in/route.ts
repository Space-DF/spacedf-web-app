// pages/api/submit-form.ts
import { NextRequest, NextResponse } from 'next/server'
import { ApiErrorResponse, ApiResponse } from '@/types/global'
import { FetchAPI } from '@/lib/fecth'
import { z } from 'zod'
import { singInSchema } from '@/containers/identity/auth/sign-up-form'
import { NEXT_PUBLIC_AUTH_API } from '@/shared/env'

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const fetch = new FetchAPI()
    fetch.setURL(NEXT_PUBLIC_AUTH_API)
    const body: z.infer<typeof singInSchema> = await req.json()
    const data = await fetch.post('console/api/auth/login', body)
    return NextResponse.json({ data, message: 'success', status: 200 })
  } catch (err) {
    const { message, status = 400 } = (err as ApiErrorResponse) || {}
    return NextResponse.json(
      { message: message?.detail || 'Something went wrong', status },
      { status }
    )
  }
}

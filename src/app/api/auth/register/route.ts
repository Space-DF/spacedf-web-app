// pages/api/submit-form.ts
import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/types/global'
import { SpaceDFClient } from '@/lib/spacedf'

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    const spacedf = await SpaceDFClient.getInstance()
    const body = await req.json()

    const client = spacedf.getClient()

    const data = await client.auth.register(body)
    return NextResponse.json({ data, message: 'success', status: 200 })
  } catch (err) {
    const { error, status } = (err as ApiResponse) || {}
    return NextResponse.json(
      { message: error?.detail || 'Something went wrong', status },
      { status },
    )
  }
}

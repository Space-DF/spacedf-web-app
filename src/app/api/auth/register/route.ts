// pages/api/submit-form.ts
import SpacedfClient from '@space-df/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/types/global'

const client = new SpacedfClient({
  organization: 'spacedf-fe',
})

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await req.json()
    const data = await client.auth.register(body)
    return NextResponse.json({ data, message: 'success', status: 200 })
  } catch (err) {
    console.info(`\x1b[34mFunc: POST - PARAMS: err\x1b[0m`, err)
    const { error, status } = (err as ApiResponse) || {}
    return NextResponse.json(
      { message: error?.detail || 'Something went wrong', status },
      { status },
    )
  }
}

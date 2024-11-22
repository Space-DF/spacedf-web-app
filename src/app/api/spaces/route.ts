// pages/api/submit-form.ts
import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/types/global'
// import SpacedfClient from '@space-df/sdk'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SpaceDFClient } from '@/lib/spacedf'

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    const [session, body, spaceDFInstance] = await Promise.all([
      getServerSession(authOptions),
      req.json(),
      SpaceDFClient.getInstance(),
    ])

    spaceDFInstance.setToken(session?.user?.accessToken)
    const client = spaceDFInstance.getClient()

    const data = await client.spaces.create(body)
    return NextResponse.json({ data, message: 'success', status: 200 })
  } catch (err) {
    const { error, status } = (err as ApiResponse) || {}
    return NextResponse.json(
      { message: JSON.stringify(error) || 'Something went wrong', status },
      { status },
    )
  }
}

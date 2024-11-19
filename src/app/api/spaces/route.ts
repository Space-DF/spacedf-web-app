// pages/api/submit-form.ts
import SpacedfClient from '@space-df/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/types/global'
import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    const [session, cookieStore] = await Promise.all([
      getServerSession(authOptions),
      cookies(),
    ])
    const organization = cookieStore.get('organization')
    const client = new SpacedfClient({
      organization: organization!.value,
      APIKey: 'hULY7MMjLDnkaKJmvrH9Tmhjfq7EUX6WdvVHEFpn',
    })
    // client.setAccessToken(session?.user?.accessToken)

    const body = await req.json()
    const data = await client.spaces.create(body)
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

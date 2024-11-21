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
    console.info(`\x1b[34mFunc: POST - PARAMS: err\x1b[0m`, err)
    const { error, status } = (err as ApiResponse) || {}
    return NextResponse.json(
      { message: error?.detail || 'Something went wrong', status },
      { status },
    )
  }
}
//
// export async function POST(
//   req: NextRequest,
// ): Promise<NextResponse<ApiResponse>> {
//   try {
//     const [session, cookieStore, body] = await Promise.all([
//       getServerSession(authOptions),
//       cookies(),
//       req.json(),
//     ])
//     const organization = cookieStore.get('organization')
//     const client = new SpaceDFClient({
//       organization: organization!.value,
//       APIKey: 'hULY7MMjLDnkaKJmvrH9Tmhjfq7EUX6WdvVHEFpn',
//     })
//     console.info(
//       `\x1b[34mFunc: POST - PARAMS: organization\x1b[0m`,
//       organization,
//       session?.user?.accessToken,
//     )
//     client.setAccessToken(session?.user?.accessToken)
//     const data = await client.spaces.create(body)
//     return NextResponse.json({ data, message: 'success', status: 200 })
//   } catch (err) {
//     console.info(`\x1b[34mFunc: POST - PARAMS: err\x1b[0m`, err)
//     const { error, status } = (err as ApiResponse) || {}
//     return NextResponse.json(
//       { message: error?.detail || 'Something went wrong', status },
//       { status },
//     )
//   }
// }

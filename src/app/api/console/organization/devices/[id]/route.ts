import { NextRequest, NextResponse } from 'next/server'
import { FetchAPI } from '@/lib/fecth'
import { NEXT_PUBLIC_AUTH_API } from '@/shared/env'
import { ApiErrorResponse, ApiResponse } from '@/types/global'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'
import { EUIDevice } from '@/containers/organizations/devices/components/add-device/validator'

// const ORGANIZATION_ENDPOINT = 'console/api/organizations/devices'

const devices = {} as Record<string, EUIDevice['eui']>

export const POST = async (
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse>> => {
  const body = (await req.json()) as EUIDevice['eui']
  //   const auth = await getServerSession(authOptions)
  const id = params.id
  try {
    const fetch = new FetchAPI()
    fetch.setURL(NEXT_PUBLIC_AUTH_API)
    // const data = await fetch.post(
    //   `${ORGANIZATION_ENDPOINT}/${params.id}/`,
    //   body,
    //   {
    //     headers: { Authorization: `Bearer ${auth?.user?.accessToken}` },
    //   }
    // )

    devices[id] = [...(devices[id] || []), ...body]
    return NextResponse.json({
      data: devices[id] || [],
      message: 'success',
      status: 200,
    })
  } catch (err) {
    console.error(`\x1b[31mFunc: POST - PARAMS: err\x1b[0m`, err)
    const { message, status = 400 } = (err as ApiErrorResponse) || {}
    return NextResponse.json(
      { message: message?.detail || 'Something went wrong', status },
      { status }
    )
  }
}

export const GET = async (
  _: NextRequest,
  { params }: { params: { id: string } }
) => {
  const id = params.id
  return NextResponse.json({
    data: devices[id] || [],
    message: 'success',
    status: 200,
  })
}

export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const id = params.id
  const body = (await req.json()) as EUIDevice['eui'][0]
  const deviceId = body.id
  const fetch = new FetchAPI()
  fetch.setURL(NEXT_PUBLIC_AUTH_API)

  devices[id] = devices[id].map((device) => {
    if (device.id === deviceId) {
      return body
    }
    return device
  })
  return NextResponse.json({
    data: devices[id] || [],
    message: 'success',
    status: 200,
  })
}

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const id = params.id
  const body = (await req.json()) as EUIDevice['eui'][0]
  const deviceId = body.id
  const fetch = new FetchAPI()
  fetch.setURL(NEXT_PUBLIC_AUTH_API)

  devices[id] = devices[id].filter((device) => device.id !== deviceId)
  return NextResponse.json({
    data: devices[id] || [],
    message: 'success',
    status: 200,
  })
}

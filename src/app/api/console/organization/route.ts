import { NextRequest, NextResponse } from 'next/server'
import { FetchAPI } from '@/lib/fecth'
import { NEXT_PUBLIC_AUTH_API } from '@/shared/env'
import { ApiResponse } from '@/types/global'
import queryString from 'query-string'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const ORGANIZATION_ENDPOINT = 'console/api/organizations/'

export const POST = async (req: NextRequest) => {
  const body = await req.json()
  const auth = await getServerSession(authOptions)
  try {
    const fetch = new FetchAPI()
    fetch.setURL(NEXT_PUBLIC_AUTH_API)

    const data = await fetch.post(ORGANIZATION_ENDPOINT, body, {
      headers: { Authorization: `Bearer ${auth?.user?.accessToken}` },
    })
    return NextResponse.json({ data: data, message: 'success', status: 200 })
  } catch (err: any) {
    const { error, status } = (err as ApiResponse) || {}
    return NextResponse.json({
      message: error || 'Something went wrong',
      status,
    })
  }
}

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.nextUrl)
  const search = searchParams.get('search')
  const ordering = searchParams.get('ordering')
  const auth = await getServerSession(authOptions)

  try {
    const fetch = new FetchAPI()
    fetch.setURL(NEXT_PUBLIC_AUTH_API)
    const url = queryString.stringifyUrl({
      url: ORGANIZATION_ENDPOINT,
      query: { search, ordering },
    })
    const data = await fetch.get(url, {
      headers: { Authorization: `Bearer ${auth?.user?.accessToken}` },
    })
    return NextResponse.json({ data: data, message: 'success', status: 200 })
  } catch (err: any) {
    const { error, status } = (err as ApiResponse) || {}
    return NextResponse.json({
      message: error || 'Something went wrong',
      status,
    })
  }
}

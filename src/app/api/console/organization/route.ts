import { NextRequest, NextResponse } from 'next/server'
import { FetchAPI } from '@/lib/fecth'
import { NEXT_PUBLIC_AUTH_API } from '@/shared/env'
import { ApiResponse } from '@/types/global'
import queryString from 'query-string'

const ORGANIZATION_ENDPOINT = 'console/api/organizations/'

export const POST = async (req: NextRequest) => {
  const headers = req.headers || {}
  const body = await req.json()

  try {
    const fetch = new FetchAPI()
    fetch.setURL(NEXT_PUBLIC_AUTH_API)

    const data = await fetch.post(ORGANIZATION_ENDPOINT, body, {
      headers: { Authorization: headers.get('Authorization') || '' },
    })
    return NextResponse.json({ data: data, message: 'success', status: 200 })
  } catch (err: any) {
    console.error(`\x1b[31mFunc: GET - PARAMS: err\x1b[0m`, err)
    const { error, status } = (err as ApiResponse) || {}
    return NextResponse.json({
      message: error || 'Something went wrong',
      status,
    })
  }
}

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.nextUrl)
  const headers = req.headers || {}
  const search = searchParams.get('search')
  const ordering = searchParams.get('ordering')

  try {
    const fetch = new FetchAPI()
    fetch.setURL(NEXT_PUBLIC_AUTH_API)
    const url = queryString.stringifyUrl({
      url: ORGANIZATION_ENDPOINT,
      query: { search, ordering },
    })
    const data = await fetch.get(url, {
      headers: { Authorization: headers.get('Authorization') || '' },
    })
    return NextResponse.json({ data: data, message: 'success', status: 200 })
  } catch (err: any) {
    console.error(`\x1b[31mFunc: GET - PARAMS: err\x1b[0m`, err)
    const { error, status } = (err as ApiResponse) || {}
    return NextResponse.json({
      message: error || 'Something went wrong',
      status,
    })
  }
}

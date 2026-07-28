import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { NextRequest, NextResponse } from 'next/server'

const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const limit = searchParams.get('limit') || '10'
  const offset = searchParams.get('offset') || '0'
  const search = searchParams.get('search') || ''
  const bbox = searchParams.get('bbox') || ''
  try {
    const client = await spaceClient()
    const params = {
      include_latest_checkpoint: true,
      offset: +offset,
      limit: +limit,
      search,
      bbox,
    }
    const devices = await client.deviceSpaces.listPublic(params)
    return NextResponse.json(devices.results, {
      status: 200,
    })
  } catch (errors) {
    return handleError(errors)
  }
}

export { GET }

import { DEFAULT_PAGE_SIZE } from '@/constants'
import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { AutomationStatus } from '@/types/automation'
import { handleError } from '@/utils/error'
import { NextRequest, NextResponse } from 'next/server'

export const GET = withAuthApiRequired(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const limit = searchParams.get('limit') || DEFAULT_PAGE_SIZE
  const offset = searchParams.get('offset') || 0
  const search = searchParams.get('search') || ''
  const spaceSlug = searchParams.get('spaceSlug') || ''
  const status = searchParams.get('status') || ''

  const params = {
    limit: +limit || DEFAULT_PAGE_SIZE,
    offset: +offset || 0,
    search,
    status: status as AutomationStatus,
  }

  try {
    const spacedfClient = await spaceClient()
    const automations = await spacedfClient.telemetry.automations.list(params, {
      headers: {
        'X-Space': spaceSlug,
      },
    })
    return NextResponse.json(automations)
  } catch (error) {
    return handleError(error)
  }
})

export const POST = withAuthApiRequired(async (request: NextRequest) => {
  const spaceSlug = request.nextUrl.searchParams.get('spaceSlug') || ''

  try {
    const body = await request.json()
    const spacedfClient = await spaceClient()
    const automation = await spacedfClient.telemetry.automations.create(body, {
      headers: {
        'X-Space': spaceSlug,
      },
    })
    return NextResponse.json(automation)
  } catch (error) {
    return handleError(error)
  }
})

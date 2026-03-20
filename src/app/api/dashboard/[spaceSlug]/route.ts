import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { Dashboard } from '@/types/dashboard'
import { handleError } from '@/utils/error'
import { isDemoSubdomain, readSession } from '@/utils/server-actions'
import { NextRequest, NextResponse } from 'next/server'

const DEMO_DASHBOARDS: Dashboard[] = [
  {
    name: 'Smart Fleet Monitor',
    id: '1',
  },
  {
    name: 'Custom Color Dashboard',
    id: '2',
  },
  {
    name: 'Default Monitor',
    id: '3',
  },
]

export const GET = async (
  request: NextRequest,
  { params }: { params: { spaceSlug: string } }
) => {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') as string
    const isDemo = await isDemoSubdomain(request)
    const session = await readSession()
    if (isDemo) {
      return NextResponse.json(DEMO_DASHBOARDS)
    }
    if (!params.spaceSlug || params.spaceSlug === 'undefined' || !session) {
      return NextResponse.json([])
    }
    const spacedfClient = await spaceClient()
    spacedfClient.setAccessToken(session?.user?.access as string)
    const dashboardPagination = await spacedfClient.dashboards.list(
      { search },
      {
        headers: {
          'X-Space': params.spaceSlug,
        },
      }
    )
    return NextResponse.json(dashboardPagination.results)
  } catch (error) {
    return handleError(error)
  }
}

export const POST = withAuthApiRequired(
  async (
    request: NextRequest,
    { params }: { params: { spaceSlug: string } }
  ) => {
    try {
      const body = await request.json()
      const spacedfClient = await spaceClient()
      const dashboard = await spacedfClient.dashboards.create(body, {
        headers: {
          'X-Space': params.spaceSlug,
        },
      })
      return NextResponse.json(dashboard)
    } catch (error) {
      return handleError(error)
    }
  }
)

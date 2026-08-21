import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { isDemoSubdomain } from '@/utils/server-actions'
import { NextRequest, NextResponse } from 'next/server'

export const DELETE = withAuthApiRequired(
  async (
    request: NextRequest,
    props: {
      params: Promise<{
        dashboardId: string
        widgetId: number
        spaceSlug: string
      }>
    }
  ) => {
    const params = await props.params
    const isDemo = await isDemoSubdomain(request)
    const { dashboardId, widgetId, spaceSlug } = params
    if (isDemo) {
      return NextResponse.json({ id: widgetId })
    }

    const spacedfClient = await spaceClient()
    const response = await spacedfClient.dashboards.deleteWidget(
      dashboardId,
      widgetId,
      {
        headers: {
          'X-Space': spaceSlug,
        },
      }
    )
    return NextResponse.json(response)
  }
)

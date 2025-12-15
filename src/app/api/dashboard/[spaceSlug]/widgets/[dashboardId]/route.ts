import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { isDemoSubdomain, readSession } from '@/utils/server-actions'
import { NextResponse, NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { DEMO_WIDGET_DASHBOARD } from '@/constants/widget'

export const POST = withAuthApiRequired(
  async (
    request: NextRequest,
    { params }: { params: { dashboardId: string; spaceSlug: string } }
  ) => {
    try {
      const isDemo = await isDemoSubdomain(request)
      const body = await request.json()
      const dashboardId = params.dashboardId
      if (isDemo) {
        DEMO_WIDGET_DASHBOARD.push({
          ...body,
          dashboard: dashboardId,
          id: uuidv4(),
        })
        return NextResponse.json(body)
      }
      const spacedfClient = await spaceClient()
      const widget = await spacedfClient.dashboards.createWidget(
        dashboardId,
        body,
        {
          headers: {
            'X-Space': params.spaceSlug,
          },
        }
      )
      return NextResponse.json(widget)
    } catch (error) {
      return handleError(error)
    }
  }
)

export const GET = withAuthApiRequired(
  async (
    request: NextRequest,
    { params }: { params: { dashboardId: string; spaceSlug: string } }
  ) => {
    const dashboardId = params.dashboardId
    if (!dashboardId) {
      return NextResponse.json(
        { error: 'Dashboard ID is required' },
        { status: 400 }
      )
    }

    try {
      const isDemo = await isDemoSubdomain(request)
      const session = await readSession()
      if (isDemo || !session?.user) {
        const currentWidgets = DEMO_WIDGET_DASHBOARD.filter(
          (dashboard) => dashboard.dashboard === dashboardId
        )

        return NextResponse.json(currentWidgets)
      }
      const spacedfClient = await spaceClient()
      spacedfClient.setAccessToken(session?.user?.access as string)
      const widgets = await spacedfClient.dashboards.listWidgets(
        dashboardId,
        {},
        {
          headers: {
            'X-Space': params.spaceSlug,
          },
        }
      )
      return NextResponse.json(widgets)
    } catch (errors) {
      return handleError(errors)
    }
  }
)

export const PUT = withAuthApiRequired(
  async (
    req,
    { params }: { params: { dashboardId: string; spaceSlug: string } }
  ) => {
    try {
      const body = await req.json()
      const spacedfClient = await spaceClient()
      const response = await spacedfClient.widgets.updateWidgets(
        params.dashboardId,
        body,
        {
          headers: {
            'X-Space': params.spaceSlug,
          },
        }
      )
      return NextResponse.json(response)
    } catch (error) {
      return handleError(error)
    }
  }
)

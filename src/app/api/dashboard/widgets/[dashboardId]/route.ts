import { DEMO_WIDGET_DASHBOARD } from '@/constants/widget'
import { auth } from '@/lib/auth'
import { handleError } from '@/utils/error'
import { isDemoSubdomain } from '@/utils/server-actions'
import { NextResponse, NextRequest } from 'next/server'

export const GET = async (
  request: NextRequest,
  { params }: { params: { dashboardId: string } }
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
    const session = await auth()
    if (isDemo || !session?.user.id) {
      const currentWidgets = DEMO_WIDGET_DASHBOARD.find(
        (dashboard) => dashboard.dashboardId === +dashboardId
      )
      return NextResponse.json(currentWidgets)
    }
    return NextResponse.json([])
  } catch (errors: any) {
    return handleError(errors)
  }
}

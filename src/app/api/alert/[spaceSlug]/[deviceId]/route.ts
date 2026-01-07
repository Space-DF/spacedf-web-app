import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { format } from 'date-fns'
import { NextRequest, NextResponse } from 'next/server'

export const GET = withAuthApiRequired(
  async (
    req: NextRequest,
    { params }: { params: { spaceSlug: string; deviceId: string } }
  ) => {
    try {
      const startDate = req.nextUrl.searchParams.get('start_date')
      const endDate = req.nextUrl.searchParams.get('end_date')
      const now = format(new Date(), 'yyyy-MM-dd')
      const client = await spaceClient()
      const alerts = await client.telemetry.alerts.list(
        {
          start_date: startDate || now,
          end_date: endDate || now,
          device_id: params.deviceId,
          category: 'water_depth',
        },
        {
          headers: {
            'X-Space': params.spaceSlug,
          },
        }
      )
      return NextResponse.json(alerts)
    } catch (error) {
      return handleError(error)
    }
  }
)

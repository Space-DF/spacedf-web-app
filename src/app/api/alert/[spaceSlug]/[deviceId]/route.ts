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
      const date = req.nextUrl.searchParams.get('date')
      const client = await spaceClient()
      const alerts = await client.telemetry.alerts.list(
        {
          date: date || format(new Date(), 'yyyy-MM-dd'),
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

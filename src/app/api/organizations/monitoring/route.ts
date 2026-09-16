import { dummyMonitoringSettings } from '@/data/dummy-data'
import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { isDemoSubdomain } from '@/utils/server-actions'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (
  req: NextRequest,
  context: { params: Promise<any> }
) => {
  try {
    const isDemo = await isDemoSubdomain(req)

    if (isDemo) {
      return NextResponse.json(dummyMonitoringSettings)
    }

    const handler = withAuthApiRequired(async () => {
      const client = await spaceClient()
      const settings = await client.organizations.getMonitoringSetting()
      return NextResponse.json(settings)
    })

    return await handler(req, context)
  } catch (error) {
    return handleError(error)
  }
}

import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { NextResponse } from 'next/server'

export const GET = withAuthApiRequired(async () => {
  try {
    const client = await spaceClient()
    const settings = await client.organizations.getMonitoringSetting()
    return NextResponse.json(settings)
  } catch (error) {
    return handleError(error)
  }
})

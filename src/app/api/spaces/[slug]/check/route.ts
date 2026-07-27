import { NextRequest, NextResponse } from 'next/server'

import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { CheckSpaceAccessResponse } from '@/types/space'
import { handleError } from '@/utils/error'
import { isDemoSubdomain } from '@/utils/server-actions'

const GET = withAuthApiRequired(
  async (req: NextRequest, { params }: { params: { slug: string } }) => {
    const isDemo = await isDemoSubdomain(req)

    if (isDemo || !params.slug || params.slug === 'undefined') {
      return NextResponse.json<CheckSpaceAccessResponse>({ is_locked: false })
    }

    try {
      const spacedfClient = await spaceClient()
      await spacedfClient.spaces.checkOrgByslugName(params.slug)

      return NextResponse.json<CheckSpaceAccessResponse>({ is_locked: false })
    } catch (errors) {
      return handleError(errors)
    }
  }
)

export { GET }

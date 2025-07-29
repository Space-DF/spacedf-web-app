// pages/api/submit-form.ts
import { NextResponse } from 'next/server'

import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { isDemoSubdomain } from '@/utils/server-actions'
import { DEMO_SPACE_ROLES } from '@/constants'

const GET = withAuthApiRequired(
  async (req, { params }: { params: { slug: string } }) => {
    const isDemo = await isDemoSubdomain(req)
    if (isDemo) {
      return NextResponse.json(DEMO_SPACE_ROLES)
    }
    const spacedfClient = await spaceClient()
    const searchParams = req.nextUrl.searchParams
    const {
      pageIndex = 0,
      limit = 10,
      search = '',
    } = Object.fromEntries(searchParams)
    try {
      const roles = await spacedfClient.spaceRoles.list(params.slug, {
        offset: +pageIndex * +limit,
        limit: +limit,
        search,
      })

      return NextResponse.json(roles)
    } catch (errors) {
      return handleError(errors)
    }
  }
)

export { GET }

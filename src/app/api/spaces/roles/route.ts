// pages/api/submit-form.ts
import { NextResponse } from 'next/server'

import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'

const GET = withAuthApiRequired(async () => {
  const spacedfClient = await spaceClient()

  try {
    const roles = await spacedfClient.spaceRoles.list({})

    return NextResponse.json(roles)
  } catch (errors) {
    return handleError(errors)
  }
})

export { GET }

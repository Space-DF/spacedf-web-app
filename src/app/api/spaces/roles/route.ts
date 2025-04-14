// pages/api/submit-form.ts
import { NextResponse } from 'next/server'

import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'

const GET = withAuthApiRequired(async () => {
  const spacedfClient = await spaceClient()

  try {
    const roles = await spacedfClient.spaceRoles.list({})

    return NextResponse.json(roles)
  } catch (errors: any) {
    return NextResponse.json(
      {
        ...(errors?.error || {}),
      },
      {
        status: errors.status,
      }
    )
  }
})

export { GET }

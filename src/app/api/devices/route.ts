import { devices } from '@/data/dummy-data'
import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { NextResponse } from 'next/server'

const GET = withAuthApiRequired(async () => {
  try {
    const deviceObjs = devices.reduce(
      (base, current) => ({
        ...base,
        [current.id]: current,
      }),
      {}
    )
    return NextResponse.json(deviceObjs, {
      status: 200,
    })
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

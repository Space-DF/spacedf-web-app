import { devices } from '@/data/dummy-data'
import { NextResponse } from 'next/server'

const GET = async () => {
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
}

export { GET }

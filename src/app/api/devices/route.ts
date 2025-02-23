import { devices } from '@/data/dummy-data'
import { NextResponse } from 'next/server'

const GET = async () => {
  try {
    return NextResponse.json(devices, {
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

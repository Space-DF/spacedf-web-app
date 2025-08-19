import { devices } from '@/data/dummy-data'
import { isDanangSubdomain } from '@/utils/server-actions'
import { NextRequest, NextResponse } from 'next/server'

const GET = async (request: NextRequest) => {
  try {
    const isDanang = await isDanangSubdomain(request)
    return NextResponse.json(isDanang ? [devices[0]] : devices, {
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

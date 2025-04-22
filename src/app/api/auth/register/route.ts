// pages/api/submit-form.ts
import { NextRequest, NextResponse } from 'next/server'
import { handleError } from '@/utils/error'
import { SpaceDFClient } from '@/lib/spacedf'

export async function POST(req: NextRequest) {
  try {
    const spacedf = await SpaceDFClient.getInstance()
    const body = await req.json()

    const client = spacedf.getClient()
    const data = (await client.auth.register(body)) as unknown as {
      access: string
    }
    spacedf.setToken(data.access)
    return NextResponse.json(data)
  } catch (err) {
    return handleError(err)
  }
}

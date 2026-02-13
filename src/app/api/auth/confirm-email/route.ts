import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { NextRequest, NextResponse } from 'next/server'

export const POST = async (request: NextRequest) => {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    const client = await spaceClient()
    await client.auth.sendEmailConfirm({ email })
    return NextResponse.json({ message: 'Email sent' }, { status: 200 })
  } catch (error) {
    return handleError(error)
  }
}

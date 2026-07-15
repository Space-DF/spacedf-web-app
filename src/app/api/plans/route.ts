import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { NextRequest, NextResponse } from 'next/server'

type PlanCode = 'free' | 'pro'

export const GET = withAuthApiRequired(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const planParam = searchParams.get('plan')
  const plan: PlanCode = planParam === 'pro' ? 'pro' : 'free'
  try {
    const client = await spaceClient()
    const response = await client.plans.retrieve(plan)
    return NextResponse.json(response)
  } catch (error) {
    return handleError(error)
  }
})

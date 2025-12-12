import { dummyAlerts } from '@/data/dummy-data'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (_: NextRequest) => {
  return NextResponse.json(dummyAlerts)
}

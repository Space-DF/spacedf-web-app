import { ApiResponse } from '@/types/global'
import { NextResponse } from 'next/server'

export const handleError = (err: any) => {
  const { error, status } = (err as ApiResponse) || {}
  return NextResponse.json(
    { message: error?.detail || error?.result || 'Something went wrong' },
    { status: status || 500 }
  )
}

import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { NextResponse } from 'next/server'

// Public device-space detail (org-scoped, no auth). `id` is the device-space id.
export const GET = async (
  _: Request,
  { params }: { params: { id: string } }
) => {
  const { id } = params
  try {
    const client = await spaceClient()
    const device = await client.deviceSpaces.retrievePublic(id)
    return NextResponse.json(device)
  } catch (error) {
    return handleError(error)
  }
}

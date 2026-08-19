import { spaceClient } from '@/lib/spacedf'
import { handleError } from '@/utils/error'
import { NextResponse } from 'next/server'

export const GET = async (
  _: Request,
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params
  const { id } = params
  try {
    const client = await spaceClient()
    const device = await client.deviceSpaces.retrievePublic(id)
    return NextResponse.json(device)
  } catch (error) {
    return handleError(error)
  }
}

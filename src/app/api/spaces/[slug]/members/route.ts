import { NextResponse } from 'next/server'

import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { InviteMember } from '@/types/members'

export const POST = withAuthApiRequired(async (req) => {
  try {
    const body: InviteMember[] = await req.json()
    const spacedfClient = await spaceClient()
    const invitation = await spacedfClient.spaces.invitation({
      receiver_list: body,
    })
    return NextResponse.json(invitation)
  } catch (error: any) {
    return NextResponse.json(
      {
        ...(error?.error || {}),
      },
      { status: error.status }
    )
  }
})

export const GET = withAuthApiRequired(async (req) => {
  const searchParams = req.nextUrl.searchParams
  const {
    pageIndex = 0,
    limit = 10,
    search = '',
  } = Object.fromEntries(searchParams)
  const spacedfClient = await spaceClient()
  const members = await spacedfClient.spaceRoleUsers.list({
    offset: +pageIndex * +limit,
    limit: +limit,
    search,
  })
  return NextResponse.json(members)
})

export const DELETE = withAuthApiRequired(async (req) => {
  try {
    const spacedfClient = await spaceClient()
    const { id } = await req.json()
    const member = await spacedfClient.spaceRoleUsers.delete(id)
    return NextResponse.json(member)
  } catch (error: any) {
    return NextResponse.json(
      {
        ...(error?.error || {}),
      },
      { status: error.status }
    )
  }
})

export const PATCH = withAuthApiRequired(async (req) => {
  try {
    const spacedfClient = await spaceClient()
    const { id, space_role } = await req.json()
    const member = await spacedfClient.spaceRoleUsers.update(id, {
      space_role,
    })
    return NextResponse.json(member)
  } catch (error: any) {
    return NextResponse.json(
      {
        ...(error?.error || {}),
      },
      { status: error.status }
    )
  }
})

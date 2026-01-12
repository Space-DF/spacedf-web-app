import { NextResponse } from 'next/server'

import { withAuthApiRequired } from '@/lib/auth-middleware/with-auth-api'
import { spaceClient } from '@/lib/spacedf'
import { InviteMember } from '@/types/members'
import { handleError } from '@/utils/error'
import { isDemoSubdomain } from '@/utils/server-actions'
import { DEMO_SPACE_MEMBERS } from '@/constants'

export const POST = withAuthApiRequired(
  async (req, { params }: { params: { slug: string } }) => {
    const isDemo = await isDemoSubdomain(req)
    if (isDemo) {
      return NextResponse.json({})
    }
    try {
      const body: InviteMember[] = await req.json()
      const spacedfClient = await spaceClient()
      const invitation = await spacedfClient.spaces.invitation({
        receiver_list: body,
        'X-Space': params.slug,
      })
      return NextResponse.json(invitation)
    } catch (error) {
      return handleError(error)
    }
  }
)

export const GET = withAuthApiRequired(
  async (req, { params }: { params: { slug: string } }) => {
    const searchParams = req.nextUrl.searchParams
    const {
      pageIndex = 0,
      limit = 10,
      search = '',
    } = Object.fromEntries(searchParams)
    const isDemo = await isDemoSubdomain(req)
    if (isDemo) {
      return NextResponse.json(DEMO_SPACE_MEMBERS)
    }
    const spacedfClient = await spaceClient()
    const members = await spacedfClient.spaceRoleUsers.list(params.slug, {
      offset: +pageIndex * +limit,
      limit: +limit,
      search,
    })
    return NextResponse.json(members)
  }
)

export const DELETE = withAuthApiRequired(
  async (req, { params }: { params: { slug: string } }) => {
    try {
      const spacedfClient = await spaceClient()
      const { id } = await req.json()
      const member = await spacedfClient.spaceRoleUsers.delete(id, {
        'X-Space': params.slug,
      })
      return NextResponse.json(member)
    } catch (error) {
      return handleError(error)
    }
  }
)

export const PATCH = withAuthApiRequired(
  async (req, { params }: { params: { slug: string } }) => {
    try {
      const spacedfClient = await spaceClient()
      const { id, space_role } = await req.json()
      const member = await spacedfClient.spaceRoleUsers.update(id, {
        space_role,
        'X-Space': params.slug,
      })
      return NextResponse.json(member)
    } catch (error) {
      return handleError(error)
    }
  }
)

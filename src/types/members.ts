import { SpaceUser } from './common'
import { SpaceRole } from './space'

export interface Member {
  id: string
  organization_user: SpaceUser & {
    is_owner: boolean
    location: string
    title: string
  }
  space_role: SpaceRole
  created_at: string
}

export interface InviteMember {
  email: string
  space_role_id: string
}

import { PaginationResponse } from '@/types/global'
import { Member } from '@/types/members'
import { Space, SpaceRole } from '@/types/space'

export const DEMO_SUBDOMAIN = 'demo'

export const DEMO_USER = {
  id: 'demo-user-id',
  email: 'demo@example.com',
  first_name: 'Demo',
  last_name: 'User',
  company_name: 'Demo Company',
  avatar: null,
  title: 'Demo Title',
  location: 'Demo Location',
  access: 'demo-access-token-' + Date.now(),
  refresh: 'demo-refresh-token-' + Date.now(),
}

export const DEMO_SPACE: PaginationResponse<Space> = {
  results: Array.from({ length: 4 }, (_, i) => {
    const idSuffix = i + 1
    const now = new Date().toISOString()
    return {
      id: `demo-space-id-${idSuffix}`,
      name: `Demo Space ${idSuffix}`,
      slug_name: `demo-space-${idSuffix}`,
      logo: '',
      created_at: now,
      updated_at: now,
      default_display: true,
      is_active: true,
      total_devices: 0,
      created_by: `demo-user-id-${idSuffix}`,
    }
  }),
}

export const DEMO_SPACE_ROLES: PaginationResponse<SpaceRole> = {
  results: [
    {
      id: 'demo-space-role-id-1',
      name: 'Admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      policies: [],
      space: 'demo-space-id',
    },
    {
      id: 'demo-space-role-id-2',
      name: 'Viewer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      policies: [],
      space: 'demo-space-id',
    },
  ],
}

const roles = ['demo-space-role-id-1', 'demo-space-role-id-2']

export const DEMO_SPACE_MEMBERS: PaginationResponse<Member> = {
  count: 4,
  next: undefined,
  previous: undefined,
  results: Array.from({ length: 4 }, (_, i) => {
    const idSuffix = i + 1
    const now = new Date().toISOString()

    return {
      id: `demo-space-member-id-${idSuffix}`,
      space_role: {
        id: `demo-space-role-id-${(i % roles.length) + 1}`,
        name: roles[(i % roles.length) + 1],
        created_at: now,
        updated_at: now,
        policies: [],
        space: 'demo-space-id',
      },
      organization_user: {
        id: `demo-user-id-${idSuffix}`,
        email: `user${idSuffix}@example.com`,
        first_name: `User${idSuffix}`,
        last_name: `Lastname${idSuffix}`,
        avatar: '',
        is_owner: i % 2 === 0,
        location: 'Demo Location',
        title: 'Demo Title',
      },
      created_at: now,
    }
  }),
}

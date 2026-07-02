export const queryKeys = {
  spaces: {
    all: ['spaces'] as const,
    list: () => [...queryKeys.spaces.all, 'list'] as const,
    detail: (slug: string) =>
      [...queryKeys.spaces.all, 'detail', slug] as const,
    roles: (slug: string) =>
      [...queryKeys.spaces.detail(slug), 'roles'] as const,
    members: (
      slug: string,
      params: { pageIndex?: number; limit?: number; search?: string } = {}
    ) => [...queryKeys.spaces.detail(slug), 'members', params] as const,
  },
  devices: {
    all: ['devices'] as const,
    list: () => [...queryKeys.devices.all, 'list'] as const,
    detail: () => [...queryKeys.devices.all, 'detail'] as const,
  },
  deviceEntities: {
    all: ['device-entities'] as const,
  },
  buildings: {
    all: ['buildings'] as const,
    list: (
      spaceSlug: string,
      params: { limit?: number; offset?: number } = {}
    ) => [...queryKeys.buildings.all, 'list', spaceSlug, params] as const,
  },
  devVerification: {
    check: () => ['check-dev-verification'] as const,
  },
  geofences: {
    all: ['geofences'] as const,
  },
  events: {
    all: ['events'] as const,
  },
  dashboards: {
    all: ['dashboards'] as const,
    list: (spaceSlug: string, search?: string) =>
      [...queryKeys.dashboards.all, 'list', spaceSlug, { search }] as const,
  },
  profile: {
    detail: () => ['profile'] as const,
  },
} as const

export const queryKeys = {
  spaces: {
    all: ['spaces'] as const,
    list: () => [...queryKeys.spaces.all, 'list'] as const,
    detail: (slug: string) =>
      [...queryKeys.spaces.all, 'detail', slug] as const,
  },
  devices: {
    all: ['devices'] as const,
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
} as const

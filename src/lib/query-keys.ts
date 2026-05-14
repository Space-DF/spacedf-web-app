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
} as const

export const queryKeys = {
  trips: {
    all: ['trips'] as const,
    list: () => ['trips', 'list'] as const,
    detail: (tripId: string) => ['trips', 'detail', tripId] as const,
  },
  records: {
    all: ['records'] as const,
    list: (tripId?: string) => ['records', 'list', { tripId: tripId ?? null }] as const,
  },
} as const

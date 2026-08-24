import { QueryClient } from '@tanstack/react-query'

export const QUERY_STALE_TIME_MS = 60 * 1000
export const QUERY_GC_TIME_MS = 10 * 60 * 1000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIME_MS,
      gcTime: QUERY_GC_TIME_MS,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
})

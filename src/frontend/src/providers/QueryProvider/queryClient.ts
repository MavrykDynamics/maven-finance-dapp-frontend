import { QueryClient } from '@tanstack/react-query'

/**
 * Default stale time: 30 seconds.
 * Data fetched within the last 30s is served from cache without refetching.
 * This prevents redundant network requests when components re-mount or
 * multiple components consume the same query.
 *
 * Individual queries can override this via the `staleTime` option in
 * useGraphQLQuery / useGraphQLQueryOnce.
 */
export const DEFAULT_STALE_TIME = 30_000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME,
      refetchOnWindowFocus: true,
      retry: 2,
      // gcTime defaults to 5 minutes — keeps unused cache entries for quick restoration
    },
  },
})

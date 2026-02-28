import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { DocumentNode } from 'graphql'
import { TypedDocumentNode } from '@graphql-typed-document-node/core'

import { graphqlClient } from './graphqlClient'
import { DEFAULT_STALE_TIME } from './queryClient'

const REFRESH_INTERVAL = 30_000 // 30 seconds

/**
 * Cache duration presets for different data types.
 * Use these with the `staleTime` option in useGraphQLQuery/useGraphQLQueryOnce.
 *
 * - CACHE_STATIC: Data that rarely changes (config, contract addresses) — 5 minutes
 * - CACHE_SEMI_STATIC: Data that changes occasionally (token metadata, oracle configs) — 60 seconds
 * - CACHE_DYNAMIC: Default for most data (balances, markets, prices) — 30 seconds
 * - CACHE_NONE: Always refetch (real-time data, post-action verification) — 0
 */
export const CACHE_STATIC = 5 * 60_000
export const CACHE_SEMI_STATIC = 60_000
export const CACHE_DYNAMIC = DEFAULT_STALE_TIME
export const CACHE_NONE = 0

type GraphQLQueryOptions<TData, TVariables> = {
  skip?: boolean
  variables?: TVariables
  onCompleted?: (data: TData) => void
  onError?: (error: Error) => void
  staleTime?: number
}

type GraphQLRefetchOptions<TVariables> = {
  refetchQueryVariables?: (() => TVariables) | TVariables
}

/**
 * Extract the operation name from a GraphQL DocumentNode for use as a query key.
 */
const getQueryName = (document: DocumentNode): string => {
  const definition = document.definitions[0]
  if (definition.kind === 'OperationDefinition' && definition.name) {
    return definition.name.value
  }
  return 'unknown'
}

/**
 * Replacement for useQueryWithRefetch (Apollo) using TanStack Query.
 *
 * Maintains the same callback-based API (onCompleted, onError) for backwards
 * compatibility with provider state management patterns.
 *
 * Features:
 * - 30-second auto-refetch interval (pauses when tab is hidden)
 * - Supports dynamic refetch variables via refetchQueryVariables
 * - Supports skip/enabled toggling
 * - Query invalidation via queryClient.invalidateQueries()
 * - Configurable staleTime per query (defaults to 30s)
 */
export const useGraphQLQuery = <TData = unknown, TVariables extends Record<string, unknown> = Record<string, unknown>>(
  document: DocumentNode | TypedDocumentNode<TData, TVariables>,
  queryOptions: GraphQLQueryOptions<TData, TVariables>,
  refetchOptions?: GraphQLRefetchOptions<TVariables>,
) => {
  const queryName = getQueryName(document)
  const { skip, variables, onCompleted, onError, staleTime } = queryOptions
  const { refetchQueryVariables } = refetchOptions ?? {}

  // Store callbacks in refs so effects always call the latest version.
  // Callbacks are inline arrows that change reference every render, but the
  // effects only re-run when result.data/result.error change. Without refs,
  // the effect captures a stale callback from the render where data first arrived.
  const onCompletedRef = useRef(onCompleted)
  const onErrorRef = useRef(onError)
  onCompletedRef.current = onCompleted
  onErrorRef.current = onError

  // Track whether onCompleted has been called for this data to avoid duplicate calls
  const lastProcessedDataRef = useRef<TData | null>(null)
  const lastProcessedErrorRef = useRef<Error | null>(null)

  const result = useQuery<TData>({
    queryKey: variables ? [queryName, variables] : [queryName],
    queryFn: async () => {
      // Use refetchQueryVariables if provided (for dynamic variables like timestamps)
      const fetchVars = refetchQueryVariables
        ? typeof refetchQueryVariables === 'function'
          ? refetchQueryVariables()
          : refetchQueryVariables
        : variables

      return graphqlClient.request<TData>(document, fetchVars as Record<string, unknown>)
    },
    enabled: !skip,
    refetchInterval: REFRESH_INTERVAL,
    refetchIntervalInBackground: false, // pause when tab is hidden
    refetchOnWindowFocus: true,
    staleTime: staleTime ?? DEFAULT_STALE_TIME,
    retry: 2,
  })

  // onCompleted callback — fires when new data arrives
  useEffect(() => {
    if (result.data && result.data !== lastProcessedDataRef.current) {
      lastProcessedDataRef.current = result.data
      onCompletedRef.current?.(result.data)
    }
  }, [result.data])

  // onError callback — fires when an error occurs
  useEffect(() => {
    if (result.error && result.error !== lastProcessedErrorRef.current) {
      lastProcessedErrorRef.current = result.error
      onErrorRef.current?.(result.error)
    }
  }, [result.error])

  return result
}

/**
 * Replacement for plain Apollo useQuery (no auto-refetch).
 * Used by providers that only need initial data load.
 * Defaults to CACHE_STATIC (5 min) since these are typically config/metadata queries.
 */
export const useGraphQLQueryOnce = <
  TData = unknown,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(
  document: DocumentNode | TypedDocumentNode<TData, TVariables>,
  queryOptions: GraphQLQueryOptions<TData, TVariables>,
) => {
  const queryName = getQueryName(document)
  const { skip, variables, onCompleted, onError, staleTime } = queryOptions

  const onCompletedRef = useRef(onCompleted)
  const onErrorRef = useRef(onError)
  onCompletedRef.current = onCompleted
  onErrorRef.current = onError

  const lastProcessedDataRef = useRef<TData | null>(null)
  const lastProcessedErrorRef = useRef<Error | null>(null)

  const result = useQuery<TData>({
    queryKey: variables ? [queryName, variables] : [queryName],
    queryFn: async () => {
      return graphqlClient.request<TData>(document, variables as Record<string, unknown>)
    },
    enabled: !skip,
    refetchInterval: false, // no auto-refetch
    staleTime: staleTime ?? CACHE_STATIC, // default to 5 min for one-time queries
    retry: 2,
  })

  useEffect(() => {
    if (result.data && result.data !== lastProcessedDataRef.current) {
      lastProcessedDataRef.current = result.data
      onCompletedRef.current?.(result.data)
    }
  }, [result.data])

  useEffect(() => {
    if (result.error && result.error !== lastProcessedErrorRef.current) {
      lastProcessedErrorRef.current = result.error
      onErrorRef.current?.(result.error)
    }
  }, [result.error])

  return result
}

/**
 * Imperative GraphQL request for use outside of React components/hooks.
 * Replaces apolloClient.query() calls.
 * Note: These bypass the query cache intentionally — they are one-off fetches
 * used for existence checks and post-action data loading.
 */
export const fetchGraphQLData = async <
  TData = unknown,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
>(
  document: DocumentNode | TypedDocumentNode<TData, TVariables>,
  variables?: TVariables,
): Promise<TData> => {
  return graphqlClient.request<TData>(document, variables as Record<string, unknown>)
}

/**
 * Invalidate all queries — replaces forcedUpdateProxy.
 * Called after contract actions complete to refresh all data.
 */
export const useInvalidateAllQueries = () => {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries()
  }
}

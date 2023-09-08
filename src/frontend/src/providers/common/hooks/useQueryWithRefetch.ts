import { useCallback, useEffect, useRef } from 'react'
import { DocumentNode, OperationVariables, QueryHookOptions, TypedDocumentNode, useQuery } from '@apollo/client'

import { currentIndexerLevelProxy } from '../utils/observeCurrentIndexerLevel'
import { usePrevious } from 'react-use'
import { isAbortError } from 'errors/error'

/**
 *
 * @param query - query we want to refetch
 * @param queryOptions – options for apollo's useQuery hook (do not modified)
 * @param refetchOptions – options for custom refetch logic
 *    @param refetchOptions -> @blocksDiff - load query with certain inverval of block difference
 *    @param refetchOptions -> @refetchQueryVariables - fn that returns variables, if value is dynamic, or variables itself for query refetch
 *
 *
 * @returns returned default params from apollo's useQuery
 *
 * NOTES:
 *    --- variables should consist of primitive values
 *    --- if variable change it will provoke useQuery to work, so we don't need to pass new variables to refetch function, cuz refetch won't work
 *    --- @refetchQueryVariables should be in UseCallback if it depends on data from cmp/hook, or be outside cmp/hook to not provoke useCallback to recreate refetch fn on parent's rerender
 */
export const useQueryWithRefetch = <TData = unknown, TVariables extends OperationVariables = OperationVariables>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  queryOptions: QueryHookOptions<TData, TVariables>,
  refetchOptions?: {
    blocksDiff?: number
    name?: string
    refetchQueryVariables?: (() => TVariables) | TVariables
  },
) => {
  const lastUpdatedBlock = useRef<null | number>(null)
  const refetchId = useRef<null | string>(null)
  const isInitialQueryDone = useRef(false)

  const prevQueryVariables = usePrevious(queryOptions?.variables)
  const currentQueryVariables = queryOptions?.variables

  const { blocksDiff, refetchQueryVariables, name = 'default name' } = refetchOptions ?? {}
  const userQuerySkip = queryOptions?.skip

  // Effect to reset isInitialQueryDone, on variables change
  useEffect(() => {
    if (prevQueryVariables && currentQueryVariables) {
      const isVariablesEq = Object.keys(currentQueryVariables ?? {}).every((key) => {
        const currentValue = currentQueryVariables?.[key]
        const prevValue = prevQueryVariables?.[key]

        return currentValue === prevValue
      })

      // if variables are different, we need to reset isInitialQueryDone, to load it's data, without waiting for refetch
      if (!isVariablesEq) isInitialQueryDone.current = false
    }
  }, [queryOptions?.variables])

  /**
   * completing 1st query fetch and getting callback to refetch this query later
   *
   * skip query when:
   * 1. we have already loaded for the 1st time, we need to refetch it only
   * 2. user skip for query
   */
  const queryResult = useQuery(query, {
    ...queryOptions,
    skip: isInitialQueryDone.current || userQuerySkip,
    onCompleted: (data) => {
      if (!data) return
      isInitialQueryDone.current = true

      queryOptions?.onCompleted?.(data)
    },
    notifyOnNetworkStatusChange: true,
  })

  // callback to refetch query on block lvl change
  const refetchQuery = useCallback(
    async (newIndexerLevel: number) => {
      try {
        // If we have't completed initial query, we can't refetch
        if (!isInitialQueryDone.current) return

        const newRefetchVariables =
          typeof refetchQueryVariables === 'function' ? refetchQueryVariables() : refetchQueryVariables

        // blocks diff case, call refetch only when block difference is more equal than specified in blocksDiff
        if (typeof blocksDiff === 'number') {
          // if we don't have blocks diff first indexer change just set lastUpdatedBlock
          if (lastUpdatedBlock.current === null) {
            lastUpdatedBlock.current = newIndexerLevel
            return
          }

          if (newIndexerLevel - lastUpdatedBlock.current >= blocksDiff) {
            const refetchData = await queryResult.refetch(newRefetchVariables)
            console.log('%crefetch ', 'color: red', { refetchData, name })

            // if from refetch we have data or error, run onComplete or onError query method, cuz refetch can't do this
            if (refetchData.data) queryOptions?.onCompleted?.(refetchData.data)
            if (refetchData.error) queryOptions?.onError?.(refetchData.error)

            lastUpdatedBlock.current = newIndexerLevel
          }

          return
        }

        const refetchData = await queryResult.refetch(newRefetchVariables)
        console.log('%crefetch ', 'color: red', { refetchData, name })

        // if from refetch we have data or error, run onComplete or onError query method, cuz refetch can't do this
        if (refetchData.data) queryOptions?.onCompleted?.(refetchData.data)
        if (refetchData.error) queryOptions?.onError?.(refetchData.error)
      } catch (e) {
        if (isAbortError(e)) return
        console.error('refetch error:', { e })
      }
    },
    [blocksDiff, refetchQueryVariables],
  )

  // subscribe to indexer lvl change, and unsibscribe when component unmounts, or if it's provider when query becomes inactive
  useEffect(() => {
    if (!userQuerySkip) refetchId.current = currentIndexerLevelProxy.registerListener(refetchQuery)

    if (userQuerySkip && refetchId.current) currentIndexerLevelProxy.removeListener(refetchId.current)

    return () => {
      if (refetchId.current && userQuerySkip) currentIndexerLevelProxy.removeListener(refetchId.current)
    }
  }, [refetchQuery, userQuerySkip])

  return queryResult
}

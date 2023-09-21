import { useCallback, useEffect, useRef, useState } from 'react'
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
    refetchQueryVariables?: (() => TVariables) | TVariables
  },
) => {
  // test variable for debug
  // @ts-expect-error
  const queryName = query.definitions?.[0]?.name?.value

  // lastUpdatedBlock -> block of last query refetch, used along with blocksDiff option
  const lastUpdatedBlock = useRef<null | number>(null)

  // refetchId -> id of callback that subscibes to indexer block change
  const refetchId = useRef<null | string>(null)

  // NOTE: previously was with useRef, but on query vars change query was not recreating
  const [isInitialQueryDone, setIsInitialQueryDone] = useState(false)

  const prevQueryVariables = usePrevious(queryOptions?.variables)
  const currentQueryVariables = queryOptions?.variables

  const { blocksDiff, refetchQueryVariables } = refetchOptions ?? {}
  const userQuerySkip = queryOptions?.skip

  // Effect to reset isInitialQueryDone, on variables change
  useEffect(() => {
    if (prevQueryVariables && currentQueryVariables) {
      const isVarsChanged = Object.keys(currentQueryVariables ?? {}).some((key) => {
        return currentQueryVariables?.[key] !== prevQueryVariables?.[key]
      })

      // if variables are different, we need to reset isInitialQueryDone, to load it's data, without waiting for refetch
      if (isVarsChanged) setIsInitialQueryDone(false)
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
    skip: isInitialQueryDone || userQuerySkip,
    onCompleted: (data) => {
      if (!data) return
      setIsInitialQueryDone(true)

      queryOptions?.onCompleted?.(data)
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
  })

  // callback to refetch query on block lvl change
  const refetchQuery = useCallback(
    async (newIndexerLevel: number) => {
      try {
        // If we have't completed initial query, we can't refetch
        if (!isInitialQueryDone) return

        const newRefetchVariables =
          typeof refetchQueryVariables === 'function' ? refetchQueryVariables() : refetchQueryVariables

        if (process.env.REACT_APP_ENV === 'dev')
          console.log('%crefetch variables ', 'color: red', { queryName, newRefetchVariables })

        // blocks diff case, call refetch only when block difference is more equal than specified in blocksDiff
        if (typeof blocksDiff === 'number') {
          // if we don't have blocks diff first indexer change just set lastUpdatedBlock
          if (lastUpdatedBlock.current === null) {
            lastUpdatedBlock.current = newIndexerLevel
            return
          }

          if (newIndexerLevel - lastUpdatedBlock.current >= blocksDiff) {
            const refetchData = await queryResult.refetch(newRefetchVariables)

            if (process.env.REACT_APP_ENV === 'dev') console.log('%crefetch ', 'color: red', { refetchData, queryName })

            // if from refetch we have data or error, run onComplete or onError query method, cuz refetch can't do this
            if (refetchData.data) queryOptions?.onCompleted?.(refetchData.data)
            if (refetchData.error) queryOptions?.onError?.(refetchData.error)

            lastUpdatedBlock.current = newIndexerLevel
          }

          return
        }

        const refetchData = await queryResult.refetch(newRefetchVariables)

        if (process.env.REACT_APP_ENV === 'dev') console.log('%crefetch ', 'color: red', { refetchData, queryName })

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

  // subscribe to indexer lvl change, and unsibscribe when component unmounts, or query becomes inactive
  useEffect(() => {
    // if query is active subscibe to indexer lvl change, and save id of subscription
    if (!userQuerySkip && !refetchId.current)
      refetchId.current = currentIndexerLevelProxy.registerListener(refetchQuery)

    // if query is not active and we have id, then unsubscibe from indexer lvl change
    if (userQuerySkip && refetchId.current) currentIndexerLevelProxy.removeListener(refetchId.current)

    return () => {
      // if we have id and hook unmounts, then unsubscibe from indexer lvl change
      if (refetchId.current) currentIndexerLevelProxy.removeListener(refetchId.current)
    }
  }, [refetchQuery, userQuerySkip])

  return queryResult
}

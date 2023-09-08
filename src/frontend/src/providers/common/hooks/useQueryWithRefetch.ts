import { useCallback, useEffect, useRef } from 'react'
import { DocumentNode, OperationVariables, QueryHookOptions, TypedDocumentNode, useQuery } from '@apollo/client'

import { currentIndexerLevelProxy } from '../utils/observeCurrentIndexerLevel'

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
 *    --- if variable change it will provoke useQuery to work, so we don't need to pass new variables to refetch function, cuz refetch won't work
 *    --- @refetchQueryVariables should be in UseCallback if it depends on data from cmp/hook, or be outside cmp/hook to not provoke useCallback to recreate refetch fn on parent's rerender
 *
 * TODO: add log to effect and 50% of hook rerenders from outer listener is recreating and resubscribes to lvl in effect
 */
export const useQueryWithRefetch = <TData = unknown, TVariables extends OperationVariables = OperationVariables>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  queryOptions: QueryHookOptions<TData, TVariables> | null,
  refetchOptions?: {
    blocksDiff?: number
    name?: string
    refetchQueryVariables?: (() => TVariables) | TVariables
  },
) => {
  const lastUpdatedBlock = useRef<null | number>(null)
  const refetchId = useRef<null | string>(null)

  const { blocksDiff, refetchQueryVariables } = refetchOptions ?? {}

  // trach whether we can refetch query, cuz if we will refetch without this check we will have 2 simultamiously queries on init
  const isInitialQueryDone = useRef(false)

  // completing 1st query fetch and getting callback to refetch this query later
  const queryResult = useQuery(query, {
    ...queryOptions,
    onCompleted: (data) => {
      isInitialQueryDone.current = true
      queryOptions?.onCompleted?.(data)
    },
    notifyOnNetworkStatusChange: true,
  })

  // fn to refetch query on block lvl change
  const refetchQuery = useCallback(
    async (newIndexerLevel: number) => {
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
          console.log('refetch ', {
            queryOptions,
            queryResult,
            refetchData,
            query,
            name: refetchOptions?.name ?? 'default name',
          })
          lastUpdatedBlock.current = newIndexerLevel
        }

        return
      }

      const refetchData = await queryResult.refetch(newRefetchVariables)
      console.log('refetch ', {
        queryOptions,
        queryResult,
        refetchData,
        query,
        name: refetchOptions?.name ?? 'default name',
      })
    },
    [blocksDiff, refetchQueryVariables],
  )

  // subscribe to indexer lvl change
  useEffect(() => {
    refetchId.current = currentIndexerLevelProxy.registerListener(refetchQuery)

    return () => {
      if (refetchId.current) currentIndexerLevelProxy.removeListener(refetchId.current)
    }
  }, [refetchQuery])

  return queryResult
}

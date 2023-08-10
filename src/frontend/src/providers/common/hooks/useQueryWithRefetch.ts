import { useCallback, useEffect, useRef, useState } from 'react'
import { DocumentNode, OperationVariables, QueryHookOptions, TypedDocumentNode, useQuery } from '@apollo/client'

import { currentIndexerLevelProxy } from '../utils/observeCurrentIndexerLevel'

/**
 *
 * @param query - query we want to refetch
 * @param queryOptions – options for apollo's useQuery hook (do not modified)
 * @param refetchOptions – options for custom refetch logic
 *    @param refetchOptions -> @blocksDiff - load query with certain inverval of block difference
 *
 *
 * @returns returned default params from apollo's useQuery
 *
 * NOTES:
 *    --- if variable will change it will provoke useQuery to work, so we don't need to pass new variables to refetch function, cuz refetch won't work
 */
export const useQueryWithRefetch = <TData = unknown, TVariables extends OperationVariables = OperationVariables>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  queryOptions: QueryHookOptions<TData, TVariables> | null,
  refetchOptions?: {
    blocksDiff?: number
  },
) => {
  const { blocksDiff } = refetchOptions ?? {}

  const lastUpdatedBlock = useRef(0)

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
    (newIndexerLevel: number) => {
      // If we have't completed initial query, we can't refetch
      if (!isInitialQueryDone.current) return

      // blocks diff case, call refetch only when block difference is more equal than specified in blocksDiff
      if (typeof blocksDiff === 'number') {
        if (newIndexerLevel - lastUpdatedBlock.current >= blocksDiff) {
          queryResult.refetch()
          lastUpdatedBlock.current = newIndexerLevel
        }

        return
      }

      queryResult.refetch()
    },
    [blocksDiff],
  )

  // subscribe to indexer lvl change
  useEffect(() => {
    currentIndexerLevelProxy.registerListener(refetchQuery)

    return () => {
      currentIndexerLevelProxy.removeListener(refetchQuery)
    }
  }, [refetchQuery])

  return queryResult
}

import { useEffect, useRef, useState } from 'react'
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
  const [currentIndexedLevel, setCurrentIndexedLevel] = useState(0)
  const [lastUpdatedBlock, setLastUpdatedBlock] = useState(0)

  const isInitialQueryDone = useRef(false)

  const queryResult = useQuery(query, {
    ...queryOptions,
    onCompleted: (data) => {
      isInitialQueryDone.current = true
      queryOptions?.onCompleted?.(data)
    },
    notifyOnNetworkStatusChange: true,
  })

  const { blocksDiff } = refetchOptions ?? {}
  const refetchQuery = queryResult.refetch

  // subscribe to indexer lvl change
  useEffect(() => {
    currentIndexerLevelProxy.registerListener(setCurrentIndexedLevel)

    return () => {
      currentIndexerLevelProxy.removeListener(setCurrentIndexedLevel)
    }
  }, [])

  // refetch query on refetch options change, or on level change
  useEffect(() => {
    if (!isInitialQueryDone.current) return

    // blocks diff case, call refetch only when block difference is more equal than specified in blocksDiff
    if (typeof blocksDiff === 'number') {
      if (currentIndexedLevel - lastUpdatedBlock >= blocksDiff) {
        refetchQuery()
        setLastUpdatedBlock(currentIndexedLevel)
      }

      return
    }

    refetchQuery()
  }, [blocksDiff, currentIndexedLevel])

  return queryResult
}

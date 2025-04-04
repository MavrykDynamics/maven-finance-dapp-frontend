import { useCallback, useEffect, useRef, useState } from 'react'
import { usePrevious } from 'react-use'
import {
  ApolloQueryResult,
  DocumentNode,
  OperationVariables,
  QueryHookOptions,
  TypedDocumentNode,
  useQuery,
} from '@apollo/client'

import { currentIndexerLevelProxy } from '../utils/observeCurrentIndexerLevel'
import { isAbortError } from 'errors/error'
import { forcedUpdateProxy } from '../utils/observeForcedUpdate'

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
 *    --- on vars change should i forbid refetch call?
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
  const isRefetching = useRef(false)

  // shouldRunUseQuery -> when variables changing we need to rerun useQuery, isInitialQueryDone is ref so resetting it won't trigger useQuery rerun
  const [shouldRunUseQuery, setShouldRunUseQuery] = useState(true)

  // isInitialQueryDone -> managing completing useQuery only 1 time, so not to rerun useQuery after every provider | hook that uses it rerender
  const isInitialQueryDone = useRef(false)

  const prevQueryVariables = usePrevious(queryOptions?.variables)
  const currentQueryVariables = queryOptions?.variables
  const prevUserSkipValue = usePrevious(queryOptions?.skip)
  const currentUserSkipValue = queryOptions?.skip

  const { blocksDiff = 7, refetchQueryVariables } = refetchOptions ?? {}

  // Effect to reset isInitialQueryDone, on variables change
  useEffect(() => {
    if (prevQueryVariables && currentQueryVariables) {
      const isVarsChanged = Object.keys(currentQueryVariables ?? {}).some((key) => {
        return currentQueryVariables?.[key] !== prevQueryVariables?.[key]
      })

      const isSkipChanged = prevUserSkipValue !== currentUserSkipValue && currentUserSkipValue

      // if variables are different, we need to reset isInitialQueryDone, to load it's data, without waiting for refetch, same for skip
      if (isVarsChanged || isSkipChanged) setShouldRunUseQuery(true)
    }
  }, [queryOptions?.skip, queryOptions.variables])

  /**
   * completing 1st query fetch and getting callback to refetch this query later
   *
   * skip query when:
   * 1. we have already loaded for the 1st time, we need to refetch it only, BUT when vars of useQuery changed we need to rerun useQuery,
   *    so skip when we have runned it already, AND no need to rerun useQuery (on vars change for example)
   * 2. user skip for query from useQueryWithRefetch props
   */
  const queryResult = useQuery(query, {
    ...queryOptions,
    skip: (isInitialQueryDone.current && !shouldRunUseQuery) || currentUserSkipValue,
    onCompleted: (data) => {
      if (!data) return
      setShouldRunUseQuery(false)
      isInitialQueryDone.current = true

      queryOptions?.onCompleted?.(data)
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
  })

  // callback to refetch query on block lvl change
  const refetchQuery = useCallback(
    // source is newIndexerLvl, or boolean when we want to refetch query after some action was completed

    async (source: number | boolean | null = null) => {
      if (!isInitialQueryDone.current || isRefetching.current) return

      isRefetching.current = true
      try {
        const variables = typeof refetchQueryVariables === 'function' ? refetchQueryVariables() : refetchQueryVariables
        let refetchData: ApolloQueryResult<TData> | null = null

        // case when we have blocks diff, and we want to refetch query only when block lvl is changed
        if (typeof blocksDiff === 'number' && typeof source === 'number') {
          // if we don't have blocks diff first indexer change just set lastUpdatedBlock
          if (lastUpdatedBlock.current === null) {
            lastUpdatedBlock.current = source
            return
          }

          if (source - lastUpdatedBlock.current >= blocksDiff) {
            refetchData = await queryResult.refetch(variables)
            lastUpdatedBlock.current = source
          }

          return
        }

        // case to refetch data after some action was completed
        if (typeof source === 'boolean') {
          refetchData = await queryResult.refetch(variables)

          // reset proxy flag
          forcedUpdateProxy.hasForcedUpdate = false
        }

        // run apollo methods on refetchData
        if (refetchData !== null) {
          if (process.env.REACT_APP_ENV === 'dev') console.log(`[${source}] Refetched`, { refetchData, queryName })

          if (refetchData.data) queryOptions?.onCompleted?.(refetchData.data)
          if (refetchData.error) queryOptions?.onError?.(refetchData.error)
        }
      } catch (e) {
        if (!isAbortError(e)) console.error(`[${source}] refetch error:`, e)
      } finally {
        isRefetching.current = false
      }
    },
    [refetchQueryVariables, queryOptions?.onCompleted, blocksDiff],
  )

  // effect to run refetch query when forcedUpdateProxy has been changed to true
  // it is used only in the Dapp provider ! DO NOT USE IT IN OTHER PLACES
  useEffect(() => {
    const id = forcedUpdateProxy.registerListener(async () => {
      if (!isInitialQueryDone.current) return

      try {
        await refetchQuery(true)
        // reset flag
        forcedUpdateProxy.hasForcedUpdate = false
      } catch (e) {
        if (isAbortError(e)) return
        console.error('refetch error from forcedUpdate:', e)
      }
    })

    return () => {
      forcedUpdateProxy.removeListener(id)
    }
  }, [refetchQuery])

  // subscribe to indexer lvl change, and unsibscribe when component unmounts, or query becomes inactive
  useEffect(() => {
    // if query is active subscibe to indexer lvl change, and save id of subscription
    if (!currentUserSkipValue && !refetchId.current) {
      if (process.env.REACT_APP_ENV === 'dev') console.log(`%cregister ${queryName}`, 'color: lime')
      refetchId.current = currentIndexerLevelProxy.registerListener(refetchQuery)
    }

    // if query is not active and we have id, then unsubscibe from indexer lvl change
    if (currentUserSkipValue && refetchId.current) {
      if (process.env.REACT_APP_ENV === 'dev') console.log(`%cunregister in callback ${queryName}`, 'color: orange')
      currentIndexerLevelProxy.removeListener(refetchId.current)
      refetchId.current = null
    }

    return () => {
      // if we have id and hook unmounts, then unsubscibe from indexer lvl change
      if (refetchId.current) {
        if (process.env.REACT_APP_ENV === 'dev') console.log(`%cunregister in cleanup ${queryName}`, 'color: orange')
        currentIndexerLevelProxy.removeListener(refetchId.current)
        refetchId.current = null
      }
    }
  }, [refetchQuery, currentUserSkipValue])

  return queryResult
}

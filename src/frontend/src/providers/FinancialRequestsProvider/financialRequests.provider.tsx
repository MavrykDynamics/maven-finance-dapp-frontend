import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'

// types
import {
  FinRequestsSubsRecordType,
  FinancialRequestsContext,
  NullableFinancialRequestsContextStateType,
} from './financialRequests.provider.types'

// consts
import { ACTIVE_FINANCIAL_REQUESTS_QUERY, ALL_FINANCIAL_REQUESTS_QUERY } from './queries/financialRequests.queries'
import {
  ALL_FIN_REQUESTS_SUB,
  DEFAULT_FINANCIAL_REQUESTS_CTX,
  DEFAULT_FIN_REQUESTS_ACTIVE_SUBS,
  FIN_REQUESTS_DATA,
  ONGOING_FIN_REQUESTS_SUB,
} from './helpers/financialRequests.consts'

// providers
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// utils
import { getFinRequestsProviderReturnValue, normalizeFinancialRequests } from './helpers/financialRequests.utils'

export const financialRequestsContext = React.createContext<FinancialRequestsContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const FinancialRequestsProvider = ({ children }: Props) => {
  const { handleApolloError } = useApolloContext()

  const [finRequestsCtxState, setFinRequestsCtxState] =
    useState<NullableFinancialRequestsContextStateType>(DEFAULT_FINANCIAL_REQUESTS_CTX)
  const [activeSubs, setActiveSubs] = useState<FinRequestsSubsRecordType>(DEFAULT_FIN_REQUESTS_ACTIVE_SUBS)
  const currentTimeRef = useRef(dayjs().toISOString())

  const refetchQueryVariables = useCallback(
    () => ({
      currentTimestamp: dayjs().toISOString(),
    }),
    [currentTimeRef.current], // to have up-to-date query data after some indexer block update, DO NOT REMOVE from deps
  )

  useEffect(() => {
    if (activeSubs[FIN_REQUESTS_DATA] !== null) {
      currentTimeRef.current = dayjs().toISOString()
    }
  }, [activeSubs])

  /**
   * ALL_FINANCIAL_REQUESTS_QUERY -> load all financial requests
   * ACTIVE_FINANCIAL_REQUESTS_QUERY -> load all active financial requests
   */
  useQueryWithRefetch(ALL_FINANCIAL_REQUESTS_QUERY, {
    skip: activeSubs[FIN_REQUESTS_DATA] !== ALL_FIN_REQUESTS_SUB,
    onCompleted: (data) => {
      const { financialRequestsIds, financialRequestMapper, ongoingFrIds, pastFrIds } = normalizeFinancialRequests(data)

      setFinRequestsCtxState((prev) => ({
        ...prev,
        financialRequestsMapper: { ...prev.financialRequestsMapper, ...financialRequestMapper },
        allFinRequestsIds: financialRequestsIds,
        ongoingFinRequestsIds: ongoingFrIds,
        pastFinRequestsIds: pastFrIds,
      }))
    },
    onError: (error) => handleApolloError(error, 'ALL_FINANCIAL_REQUESTS_QUERY'),
  })

  useQueryWithRefetch(
    ACTIVE_FINANCIAL_REQUESTS_QUERY,
    {
      skip: activeSubs[FIN_REQUESTS_DATA] !== ONGOING_FIN_REQUESTS_SUB,
      onCompleted: (data) => {
        const { financialRequestsIds, financialRequestMapper, ongoingFrIds } = normalizeFinancialRequests(data)

        setFinRequestsCtxState((prev) => ({
          ...prev,
          financialRequestsMapper: { ...prev.financialRequestsMapper, ...financialRequestMapper },
          allFinRequestsIds: Array.from(new Set([...(prev.allFinRequestsIds ?? []), ...financialRequestsIds])),
          ongoingFinRequestsIds: ongoingFrIds,
        }))
      },
      variables: {
        currentTimestamp: currentTimeRef.current,
      },
      onError: (error) => handleApolloError(error, 'ACTIVE_FINANCIAL_REQUESTS_QUERY'),
    },
    {
      refetchQueryVariables,
    },
  )

  const changeFinancialRequestsSubscriptionList = useCallback((newSkips: Partial<FinRequestsSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }, [])

  const contextProviderValue = useMemo(
    () =>
      getFinRequestsProviderReturnValue({
        finRequestsCtxState,
        changeFinancialRequestsSubscriptionList,
        activeSubs,
      }),
    [activeSubs, finRequestsCtxState],
  )

  return <financialRequestsContext.Provider value={contextProviderValue}>{children}</financialRequestsContext.Provider>
}

export const useFinancialRequestsContext = () => {
  const context = useContext(financialRequestsContext)

  if (!context) {
    throw new Error('useFinancialRequestsContext should be used within FinancialRequestsProvider')
  }

  return context
}

export default FinancialRequestsProvider

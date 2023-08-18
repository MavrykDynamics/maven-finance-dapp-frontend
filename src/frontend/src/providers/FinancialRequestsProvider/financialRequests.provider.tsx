import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ApolloError } from '@apollo/client'
import dayjs from 'dayjs'

// types
import { GetFinRequestsStorageQuery } from 'utils/__generated__/graphql'
import {
  FinRequestsSubsRecordType,
  FinancialRequestsContext,
  NullableFinancialRequestsContextStateType,
} from './financialRequests.types'

// consts
import {
  ALL_FIN_REQUESTS_SUB,
  DEFAULT_FINANCIAL_REQUESTS_CTX,
  DEFAULT_FIN_REQUESTS_ACTIVE_SUBS,
  FIN_REQUESTS_DATA,
  ONGOING_FIN_REQUESTS_SUB,
  PAST_FIN_REQUESTS_SUB,
} from './helpers/financialRequests.consts'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'

// providers
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// queries
import { getFinancialRequestsStorageSubscription } from './queries/financialRequests.queries'

// utils
import { getFinRequestsProviderReturnValue, normalizeFinancialRequests } from './helpers/financialRequests.utils'

export const financialRequestsContext = React.createContext<FinancialRequestsContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const FinancialRequestsProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()

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

  const handleSubError = (error: ApolloError, subName: string) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  useQueryWithRefetch(
    getFinancialRequestsStorageSubscription({ requestType: activeSubs[FIN_REQUESTS_DATA] }),
    {
      skip: activeSubs[FIN_REQUESTS_DATA] === null,
      onError: (error) => handleSubError(error, 'getFinancialRequestsStorageSubscription ERROR'),
      onCompleted: (data) => {
        if (!data) return
        updateFinRequestsData(data, activeSubs[FIN_REQUESTS_DATA])
      },
      variables: {
        currentTimestamp: currentTimeRef.current,
      },
    },
    {
      refetchQueryVariables,
    },
  )

  const updateFinRequestsData = (
    data: GetFinRequestsStorageQuery,
    type: FinRequestsSubsRecordType[typeof FIN_REQUESTS_DATA],
  ) => {
    const isAllFinRequests = type === ALL_FIN_REQUESTS_SUB
    const isOngoingFinRequests = type === ONGOING_FIN_REQUESTS_SUB
    const isPastFinRequests = type === PAST_FIN_REQUESTS_SUB

    // based on query type - it will return "all" | "past" | "ongoing" finrequests data
    // if it's "past" -> financialRequestsIds includes only past fin requests
    // if it's "ongoing" -> financialRequestsIds includes only ongoing fin requests
    // if it's "all" -> financialRequestsIds includes all fin requests
    const { financialRequestsIds, financialRequestMapper, ongoingFrIds, pastFrIds } = normalizeFinancialRequests(data)
    setFinRequestsCtxState((prev) => ({
      ...prev,
      allFinRequestsIds: isAllFinRequests ? financialRequestsIds : prev.allFinRequestsIds,
      // if query type is "past" set financialRequestsIds(includes only past) - same for "ongoing"
      // if its all(past & ongoing) set past and ongoing from mapper
      // else set default ids
      pastFinRequestsIds: isPastFinRequests || isAllFinRequests ? pastFrIds : prev.pastFinRequestsIds,
      ongoingFinRequestsIds: isOngoingFinRequests || isAllFinRequests ? ongoingFrIds : prev.ongoingFinRequestsIds,
      financialRequestsMapper: { ...prev.financialRequestsMapper, ...financialRequestMapper },
    }))
  }

  const changeFinancialRequestsSubscriptionList = (newSkips: Partial<FinRequestsSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }

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

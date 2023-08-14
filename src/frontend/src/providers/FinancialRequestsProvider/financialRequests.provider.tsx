import { ApolloError, QueryHookOptions } from '@apollo/client'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  FinRequestsSubsRecordType,
  FinancialRequestsContext,
  FinancialRequestsSubsType,
  NullableFinancialRequestsContextStateType,
} from './financialRequests.types'
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
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { getFinancialRequestsStorageSubscription } from './queries/financialRequests.queries'
import { getFinRequestsProviderReturnValue, normalizeFinancialRequests } from './helpers/financialRequests.utils'
import { GetFinRequestsStorageQuery } from 'utils/__generated__/graphql'
import dayjs from 'dayjs'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

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
      currentTimestamp: currentTimeRef.current,
    }),
    [currentTimeRef.current],
  )

  /**
   * chnage currentTime for sub when active sub was changed to resubscribe
   */
  useEffect(() => {
    currentTimeRef.current = dayjs().toISOString()
  }, [activeSubs])

  /**
   * updating currentTime to refetch data for fin requests if the oldest of ongoing actions expired
   * than it watches for the next one, cuz id of request was changed in the update method inside subscription
   */
  useEffect(() => {
    const _finrequest = finRequestsCtxState.closestOngoingFinRequestToBeExpired
    let timeout: NodeJS.Timeout | null = null
    if (_finrequest) {
      const expirationTime = dayjs(_finrequest.votingTillTime)

      const diff = expirationTime.diff(dayjs(), 'seconds')
      timeout = setTimeout(() => {
        currentTimeRef.current = dayjs().toISOString()
      }, diff + 5000)
    }

    return () => {
      if (timeout) clearTimeout(timeout)
    }
    // using id cuz it's object and reference can be different
  }, [finRequestsCtxState.closestOngoingFinRequestToBeExpired?.id])

  const handleSubError = (error: ApolloError, subName: FinancialRequestsSubsType) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  const defaultQueryProps: QueryHookOptions<GetFinRequestsStorageQuery> = useMemo(
    () => ({
      onCompleted: (data) => {
        if (!data) return
        console.log('Refetch logic FIN REQUESTS ', activeSubs[FIN_REQUESTS_DATA])
        updateFinRequestsData(data, activeSubs[FIN_REQUESTS_DATA])
      },
      variables: {
        currentTimestamp: currentTimeRef.current,
      },
    }),
    [activeSubs],
  )

  useQueryWithRefetch(
    getFinancialRequestsStorageSubscription({ requestType: activeSubs[FIN_REQUESTS_DATA] }),
    {
      skip: activeSubs[FIN_REQUESTS_DATA] !== ALL_FIN_REQUESTS_SUB,
      onError: (error) => handleSubError(error, ALL_FIN_REQUESTS_SUB),
      ...defaultQueryProps,
    },
    {
      refetchQueryVariables,
      blocksDiff: 200,
    },
  )

  useQueryWithRefetch(
    getFinancialRequestsStorageSubscription({ requestType: activeSubs[FIN_REQUESTS_DATA] }),
    {
      skip: activeSubs[FIN_REQUESTS_DATA] !== PAST_FIN_REQUESTS_SUB,
      onError: (error) => handleSubError(error, PAST_FIN_REQUESTS_SUB),
      ...defaultQueryProps,
    },
    {
      refetchQueryVariables,
      blocksDiff: 200,
    },
  )

  useQueryWithRefetch(
    getFinancialRequestsStorageSubscription({ requestType: activeSubs[FIN_REQUESTS_DATA] }),
    {
      skip: activeSubs[FIN_REQUESTS_DATA] !== ONGOING_FIN_REQUESTS_SUB,
      onError: (error) => handleSubError(error, ONGOING_FIN_REQUESTS_SUB),
      ...defaultQueryProps,
    },
    {
      refetchQueryVariables,
      blocksDiff: 200,
    },
  )

  const updateFinRequestsData = (
    data: GetFinRequestsStorageQuery,
    type: FinRequestsSubsRecordType[typeof FIN_REQUESTS_DATA],
  ) => {
    const isAllFinReuests = type === ALL_FIN_REQUESTS_SUB
    const isOngoingFinRequests = type === ONGOING_FIN_REQUESTS_SUB
    const isPastFinRequests = type === PAST_FIN_REQUESTS_SUB

    // based on query type - it will return "all" | "past" | "ongoing" finrequests data
    // if it's "past" -> financialRequestsIds includes only past fin requests
    // if it's "ongoing" -> financialRequestsIds includes only ongoing fin requests
    // if it's "all" -> financialRequestsIds includes all fin requests
    const { financialRequestsIds, financialRequestMapper, ongoingFrIds, pastFrIds } = normalizeFinancialRequests(data)
    setFinRequestsCtxState((prev) => ({
      ...prev,
      allFinRequestsIds: isAllFinReuests ? financialRequestsIds : prev.allFinRequestsIds,
      // if query type is "past" set financialRequestsIds(includes only past) - same for "ongoing"
      // if its all(past & ongoing) set past and ongoing from mapper
      // else set default ids
      pastFinRequestsIds: isPastFinRequests
        ? financialRequestsIds
        : isAllFinReuests
        ? pastFrIds
        : prev.pastFinRequestsIds,
      ongoingFinRequestsIds: isOngoingFinRequests
        ? financialRequestsIds
        : isAllFinReuests
        ? ongoingFrIds
        : prev.ongoingFinRequestsIds,
      financialRequestsMapper: { ...prev.financialRequestsMapper, ...financialRequestMapper },
      closestOngoingFinRequestToBeExpired: financialRequestMapper[ongoingFrIds[ongoingFrIds.length - 1] as any],
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

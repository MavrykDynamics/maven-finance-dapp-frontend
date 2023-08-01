import { ApolloError, useSubscription } from '@apollo/client'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  FinRequestsSubsRecordType,
  FinancialRequestsContext,
  FinancialRequestsStateType,
  FinancialRequestsSubsType,
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
import { GetFinRequestsStorageSubscription } from 'utils/__generated__/graphql'
import dayjs from 'dayjs'

export const financialRequestsContext = React.createContext<FinancialRequestsContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const FinancialRequestsProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()

  const [finRequestsCtxState, setFinRequestsCtxState] =
    useState<FinancialRequestsStateType>(DEFAULT_FINANCIAL_REQUESTS_CTX)
  const [activeSubs, setActiveSubs] = useState<FinRequestsSubsRecordType>(DEFAULT_FIN_REQUESTS_ACTIVE_SUBS)
  const currentTimeRef = useRef(dayjs().toISOString())

  useEffect(() => {
    currentTimeRef.current = dayjs().toISOString()
  }, [activeSubs])

  const handleSubError = (error: ApolloError, subName: FinancialRequestsSubsType) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  useSubscription(getFinancialRequestsStorageSubscription({ requestType: activeSubs[FIN_REQUESTS_DATA] }), {
    // skip: !activeSubs[PAST_FIN_REQUESTS_SUB],
    onData: ({ data: { data } }) => {
      if (!data) return
      updateFinRequestsData(data, activeSubs[FIN_REQUESTS_DATA])
    },
    variables: {
      currentTime: currentTimeRef.current,
    },
    onError: (error) => handleSubError(error, PAST_FIN_REQUESTS_SUB),
    shouldResubscribe: true,
  })

  const updateFinRequestsData = (
    data: GetFinRequestsStorageSubscription,
    type: FinRequestsSubsRecordType[typeof FIN_REQUESTS_DATA],
  ) => {
    const isAllFinReuests = type === ALL_FIN_REQUESTS_SUB
    const isOngoingFinRequests = type === ONGOING_FIN_REQUESTS_SUB
    const isPastFinRequests = type === PAST_FIN_REQUESTS_SUB

    // based on query type - it will return "all" | "past" | "ongoing" finrequests data
    const { financialRequestsIds, financialRequestMapper } = normalizeFinancialRequests(data)

    setFinRequestsCtxState((prev) => ({
      ...prev,
      allFinRequestsIds: isAllFinReuests ? financialRequestsIds : prev.allFinRequestsIds,
      pastFinRequestsIds: isPastFinRequests ? financialRequestsIds : prev.pastFinRequestsIds,
      ongoingFinRequestsIds: isOngoingFinRequests ? financialRequestsIds : prev.ongoingFinRequestsIds,
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

import { ApolloError, useSubscription } from '@apollo/client'
import React, { useContext, useMemo, useState } from 'react'
import {
  FinancialRequestType,
  FinancialRequestsContext,
  FinancialRequestsStateType,
  FinancialRequestsSubsRecordType,
  FinancialRequestsSubsType,
} from './financialRequests.types'
import {
  DEFAULT_FINANCIAL_REQUESTS_ACTIVE_SUBS,
  DEFAULT_FINANCIAL_REQUESTS_CTX,
  FIN_REQUSTS_ONGOING,
  FIN_REQUSTS_PAST,
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
  const [activeSubs, setActiveSubs] = useState<FinancialRequestsSubsRecordType>(DEFAULT_FINANCIAL_REQUESTS_ACTIVE_SUBS)
  const [ISOTimestamp, setISOTimestamp] = useState(dayjs().toISOString())

  const handleSubError = (error: ApolloError, subName: FinancialRequestsSubsType) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  // subscribes
  useSubscription(getFinancialRequestsStorageSubscription({ requestType: FIN_REQUSTS_ONGOING }), {
    skip: !activeSubs[ONGOING_FIN_REQUESTS_SUB],
    onData: ({ data: { data } }) => {
      if (!data) return
      updateFinRequestsData(data, FIN_REQUSTS_ONGOING)
    },
    variables: {
      timestamp: ISOTimestamp,
    },
    onError: (error) => handleSubError(error, ONGOING_FIN_REQUESTS_SUB),
    shouldResubscribe: true,
  })

  useSubscription(getFinancialRequestsStorageSubscription({ requestType: FIN_REQUSTS_PAST }), {
    skip: !activeSubs[PAST_FIN_REQUESTS_SUB],
    onData: ({ data: { data } }) => {
      if (!data) return
      updateFinRequestsData(data, FIN_REQUSTS_PAST)
    },
    onError: (error) => handleSubError(error, PAST_FIN_REQUESTS_SUB),
    shouldResubscribe: true,
  })

  const updateFinRequestsData = (data: GetFinRequestsStorageSubscription, type: FinancialRequestType) => {
    const { financialRequestsIds, financialRequestMapper } = normalizeFinancialRequests(data)

    console.log(financialRequestMapper, '___________________________________________________')

    setFinRequestsCtxState((prev) => ({
      ...prev,
      [`${type}FinancialRequestsIds`]: [
        ...new Set([...(prev[`${type}FinancialRequestsIds`] ?? []), ...financialRequestsIds]),
      ],
      financialRequestsMapper: { ...prev.financialRequestsMapper, ...financialRequestMapper },
    }))

    // setISOTimestamp(dayjs().toISOString())
  }

  const changeFinancialRequestsSubscriptionList = (newSkips: Partial<FinancialRequestsSubsRecordType>) => {
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

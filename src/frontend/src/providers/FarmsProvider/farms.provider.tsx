import React, { useContext, useMemo, useState } from 'react'
import { ApolloError } from '@apollo/client'

// hooks
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// consts
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { DEFAULT_FARMS_ACTIVE_SUBS, DEFAULT_FARMS_CTX, FARMS_DATA_SUB } from './helpers/farms.const'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { getFarms } from './queries/farms.query'

// utils
import { getFarmsReturnValue } from './helpers/farms.utils'

// types
import { FarmsProviderSubsType, NullableFarmCtxStateType, FarmsCtxType } from './farms.provider.types'
import { FarmsQueryQuery } from 'utils/__generated__/graphql'

export const farmsContext = React.createContext<FarmsCtxType>(undefined!)

type Props = {
  children: React.ReactNode
}

const FarmsProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()

  const [farmsCtxState, setFarmsCtxState] = useState<NullableFarmCtxStateType>(DEFAULT_FARMS_CTX)
  const [activeSubs, setActiveSubs] = useState<FarmsProviderSubsType>(DEFAULT_FARMS_ACTIVE_SUBS)

  const handleSubError = (error: ApolloError, subName: string) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  useQueryWithRefetch(getFarms(activeSubs[FARMS_DATA_SUB]), {
    skip: activeSubs[FARMS_DATA_SUB] === null,
    onError: (error) => handleSubError(error, 'getFinancialRequestsStorageSubscription ERROR'),
    onCompleted: (data) => {
      if (!data) return
      updateFarms(data)
    },
  })

  const updateFarms = (indexerData: FarmsQueryQuery) => {}

  const changeFarmsSubscriptionList = (newSkips: Partial<FarmsProviderSubsType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }

  const contextProviderValue = useMemo(
    () =>
      getFarmsReturnValue({
        farmsCtxState,
        changeFarmsSubscriptionList,
        activeSubs,
      }),
    [activeSubs, farmsCtxState],
  )

  return <farmsContext.Provider value={contextProviderValue}>{children}</farmsContext.Provider>
}

export const useFarmsContext = () => {
  const context = useContext(farmsContext)

  if (!context) {
    throw new Error('useFarmsContext should be used within FarmsProvider')
  }

  return context
}

export default FarmsProvider

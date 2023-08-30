import React, { useContext, useMemo, useState } from 'react'
import { ApolloError } from '@apollo/client'

// hooks
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// consts
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import {
  DEFAULT_FARMS_ACTIVE_SUBS,
  DEFAULT_FARMS_CTX,
  FARMS_ALL_DATA_SUB,
  FARMS_DATA_SUB,
  FARMS_FINISHED_NOT_STAKED_DATA_SUB,
  FARMS_FINISHED_STAKED_DATA_SUB,
  FARMS_LIVE_NOT_STAKED_DATA_SUB,
  FARMS_LIVE_STAKED_DATA_SUB,
} from './helpers/farms.const'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { getFarms } from './queries/farms.query'

// utils
import { getFarmsReturnValue } from './helpers/farms.utils'

// types
import { FarmsProviderSubsType, NullableFarmCtxStateType, FarmsCtxType } from './farms.provider.types'
import { FarmsQueryQuery } from 'utils/__generated__/graphql'
import { normalizeFarms } from './helpers/farms.normalizer'

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

  console.log({ activeSubs })

  useQueryWithRefetch(getFarms(activeSubs[FARMS_DATA_SUB]), {
    skip: activeSubs[FARMS_DATA_SUB] === null,
    onError: (error) => handleSubError(error, 'getFinancialRequestsStorageSubscription ERROR'),
    onCompleted: (data) => {
      if (!data) return
      updateFarms(data)
    },
  })

  const updateFarms = (indexerData: FarmsQueryQuery) => {
    const normalizedFarms = normalizeFarms(indexerData.farm, activeSubs[FARMS_DATA_SUB])

    const isAllFarmsSubActive = activeSubs[FARMS_DATA_SUB] === FARMS_ALL_DATA_SUB
    const isLiveFarmsSubActive = activeSubs[FARMS_DATA_SUB] === FARMS_LIVE_NOT_STAKED_DATA_SUB
    const isLiveStakedFarmsSubActive = activeSubs[FARMS_DATA_SUB] === FARMS_LIVE_STAKED_DATA_SUB
    const isFinishedFarmsSubActive = activeSubs[FARMS_DATA_SUB] === FARMS_FINISHED_NOT_STAKED_DATA_SUB
    const isFinishedStakedFarmsSubActive = activeSubs[FARMS_DATA_SUB] === FARMS_FINISHED_STAKED_DATA_SUB

    setFarmsCtxState((prev) => ({
      ...prev,
      farmsMapper: { ...prev.farmsMapper, ...normalizedFarms.farmsMapper },
      allFarms: isAllFarmsSubActive
        ? normalizedFarms.allFarms
        : [...(prev.allFarms ?? []), ...normalizedFarms.allFarms],
      liveNotStakedFarms:
        isAllFarmsSubActive || isLiveFarmsSubActive
          ? normalizedFarms.liveNotStakedFarms
          : [...(prev.liveNotStakedFarms ?? []), ...normalizedFarms.liveNotStakedFarms],
      liveStakedFarms:
        isAllFarmsSubActive || isLiveStakedFarmsSubActive
          ? normalizedFarms.liveStakedFarms
          : [...(prev.liveStakedFarms ?? []), ...normalizedFarms.liveStakedFarms],
      finishedNotStakedFarms:
        isAllFarmsSubActive || isFinishedFarmsSubActive
          ? normalizedFarms.finishedNotStakedFarms
          : [...(prev.finishedNotStakedFarms ?? []), ...normalizedFarms.finishedNotStakedFarms],
      finishedStakedFarms:
        isAllFarmsSubActive || isFinishedStakedFarmsSubActive
          ? normalizedFarms.finishedStakedFarms
          : [...(prev.finishedStakedFarms ?? []), ...normalizedFarms.finishedStakedFarms],
    }))
  }

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

  console.log({ contextProviderValue })

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

import React, { useContext, useMemo, useState } from 'react'

// hooks
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

// consts
import {
  DEFAULT_FARMS_ACTIVE_SUBS,
  DEFAULT_FARMS_CTX,
  FARMS_ALL_DATA_SUB,
  FARMS_ALL_FINISHED_DATA_SUB,
  FARMS_ALL_LIVE_DATA_SUB,
  FARMS_DATA_SUB,
  FARMS_FINISHED_STAKED_DATA_SUB,
  FARMS_LIVE_STAKED_DATA_SUB,
} from './helpers/farms.const'

// utils
import { getFarms } from './queries/farms.query'
import { normalizeFarms } from './helpers/farms.normalizer'
import { getFarmsReturnValue } from './helpers/farms.utils'

// types
import { FarmsProviderSubsType, NullableFarmCtxStateType, FarmsCtxType } from './farms.provider.types'
import { FarmsQueryQuery } from 'utils/__generated__/graphql'

export const farmsContext = React.createContext<FarmsCtxType>(undefined!)

type Props = {
  children: React.ReactNode
}

const FarmsProvider = ({ children }: Props) => {
  const { userAddress } = useUserContext()
  const { handleApolloError } = useApolloContext()

  const [farmsCtxState, setFarmsCtxState] = useState<NullableFarmCtxStateType>(DEFAULT_FARMS_CTX)
  const [activeSubs, setActiveSubs] = useState<FarmsProviderSubsType>(DEFAULT_FARMS_ACTIVE_SUBS)

  useQueryWithRefetch(getFarms(activeSubs[FARMS_DATA_SUB]), {
    skip: !activeSubs[FARMS_DATA_SUB],
    variables: { userAddress: userAddress ?? '' },
    onCompleted: (data) => {
      updateFarms(data)
    },
    onError: (error) => handleApolloError(error, 'getFarms'),
  })

  const updateFarms = (indexerData: FarmsQueryQuery) => {
    const normalizedFarms = normalizeFarms(indexerData.farm)

    const isAllFarmsSubActive = activeSubs[FARMS_DATA_SUB] === FARMS_ALL_DATA_SUB
    const isAllLiveFarmsSubActive = activeSubs[FARMS_DATA_SUB] === FARMS_ALL_LIVE_DATA_SUB
    const isLiveStakedFarmsSubActive = activeSubs[FARMS_DATA_SUB] === FARMS_LIVE_STAKED_DATA_SUB
    const isAllFinishedFarmsSubActive = activeSubs[FARMS_DATA_SUB] === FARMS_ALL_FINISHED_DATA_SUB
    const isFinishedStakedFarmsSubActive = activeSubs[FARMS_DATA_SUB] === FARMS_FINISHED_STAKED_DATA_SUB

    setFarmsCtxState((prev) => ({
      ...prev,
      farmsMapper: { ...prev.farmsMapper, ...normalizedFarms.farmsMapper },
      allFarms: isAllFarmsSubActive
        ? normalizedFarms.allFarms
        : [...(prev.allFarms ?? []), ...normalizedFarms.allFarms],
      allLiveFarms:
        isAllFarmsSubActive || isAllLiveFarmsSubActive
          ? normalizedFarms.allLiveFarms
          : [...(prev.allLiveFarms ?? []), ...normalizedFarms.allLiveFarms],
      liveStakedFarms:
        isAllFarmsSubActive || isLiveStakedFarmsSubActive || isAllLiveFarmsSubActive
          ? normalizedFarms.liveStakedFarms
          : [...(prev.liveStakedFarms ?? []), ...normalizedFarms.liveStakedFarms],
      allFinishedFarms:
        isAllFarmsSubActive || isAllFinishedFarmsSubActive
          ? normalizedFarms.allFinishedFarms
          : [...(prev.allFinishedFarms ?? []), ...normalizedFarms.allFinishedFarms],
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

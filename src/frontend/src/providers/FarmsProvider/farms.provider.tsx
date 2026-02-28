import React, { useCallback, useContext, useMemo, useState } from 'react'

// hooks
import { useGraphQLQuery } from 'providers/QueryProvider/useGraphQLQuery'
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

// consts
import {
  DEFAULT_FARMS_ACTIVE_SUBS,
  DEFAULT_FARMS_CTX,
  FARMS_ALL_FINISHED_DATA_SUB,
  FARMS_ALL_LIVE_DATA_SUB,
  FARMS_DATA_SUB,
  FARMS_FINISHED_STAKED_DATA_SUB,
  FARMS_LIVE_STAKED_DATA_SUB,
} from './helpers/farms.const'

// utils
import { FARMS_FINISHED_ALL, FARMS_FINISHED_STAKED, FARMS_LIVE_ALL, FARMS_LIVE_STAKED } from './queries/farms.query'
import { normalizeFarms } from './helpers/farms.normalizer'
import { getFarmsReturnValue } from './helpers/farms.utils'

// types
import {
  FarmsProviderSubsType,
  NullableFarmCtxStateType,
  FarmsCtxType,
  FarmsIndexerDataType,
} from './farms.provider.types'

export const farmsContext = React.createContext<FarmsCtxType>(undefined!)

type Props = {
  children: React.ReactNode
}

const FarmsProvider = ({ children }: Props) => {
  const { userAddress } = useUserContext()
  const { handleQueryError } = useQueryProvider()

  const [farmsCtxState, setFarmsCtxState] = useState<NullableFarmCtxStateType>(DEFAULT_FARMS_CTX)
  const [activeSubs, setActiveSubs] = useState<FarmsProviderSubsType>(DEFAULT_FARMS_ACTIVE_SUBS)

  /**
   * farms queries:
   * 1. FARMS_LIVE_ALL -> all farms that are live
   * 2. FARMS_FINISHED_ALL -> all farms that are finished
   * 3. FARMS_FINISHED_STAKED- > all farms that are finished and user is depositor in it
   * 4. FARMS_LIVE_STAKED -> all farms that are live and user is depositor in it
   */
  useGraphQLQuery(FARMS_LIVE_ALL, {
    skip: activeSubs[FARMS_DATA_SUB] !== FARMS_ALL_LIVE_DATA_SUB,
    onCompleted: (data) => updateFarms(data),
    onError: (error) => handleQueryError(error, 'FARMS_LIVE_ALL'),
  })

  useGraphQLQuery(FARMS_FINISHED_ALL, {
    skip: activeSubs[FARMS_DATA_SUB] !== FARMS_ALL_FINISHED_DATA_SUB,
    onCompleted: (data) => updateFarms(data),
    onError: (error) => handleQueryError(error, 'FARMS_FINISHED_ALL'),
  })

  useGraphQLQuery(FARMS_FINISHED_STAKED, {
    skip: activeSubs[FARMS_DATA_SUB] !== FARMS_FINISHED_STAKED_DATA_SUB,
    variables: { userAddress: userAddress ?? '' },
    onCompleted: (data) => updateFarms(data),
    onError: (error) => handleQueryError(error, 'FARMS_FINISHED_STAKED'),
  })

  useGraphQLQuery(FARMS_LIVE_STAKED, {
    skip: activeSubs[FARMS_DATA_SUB] !== FARMS_LIVE_STAKED_DATA_SUB,
    variables: { userAddress: userAddress ?? '' },
    onCompleted: (data) => updateFarms(data),
    onError: (error) => handleQueryError(error, 'FARMS_LIVE_STAKED'),
  })

  const updateFarms = (indexerData: FarmsIndexerDataType) => {
    const normalizedFarms = normalizeFarms(indexerData.farm, userAddress)

    const isAllLiveFarmsSubActive = activeSubs[FARMS_DATA_SUB] === FARMS_ALL_LIVE_DATA_SUB
    const isLiveStakedFarmsSubActive = activeSubs[FARMS_DATA_SUB] === FARMS_LIVE_STAKED_DATA_SUB
    const isAllFinishedFarmsSubActive = activeSubs[FARMS_DATA_SUB] === FARMS_ALL_FINISHED_DATA_SUB
    const isFinishedStakedFarmsSubActive = activeSubs[FARMS_DATA_SUB] === FARMS_FINISHED_STAKED_DATA_SUB

    setFarmsCtxState((prev) => ({
      ...prev,
      farmsMapper: { ...prev.farmsMapper, ...normalizedFarms.farmsMapper },
      allLiveFarms: isAllLiveFarmsSubActive
        ? normalizedFarms.allLiveFarms
        : [...(prev.allLiveFarms ?? []), ...normalizedFarms.allLiveFarms],
      liveStakedFarms:
        isLiveStakedFarmsSubActive || isAllLiveFarmsSubActive
          ? normalizedFarms.liveStakedFarms
          : [...(prev.liveStakedFarms ?? []), ...normalizedFarms.liveStakedFarms],
      allFinishedFarms: isAllFinishedFarmsSubActive
        ? normalizedFarms.allFinishedFarms
        : [...(prev.allFinishedFarms ?? []), ...normalizedFarms.allFinishedFarms],
      finishedStakedFarms: isFinishedStakedFarmsSubActive
        ? normalizedFarms.finishedStakedFarms
        : [...(prev.finishedStakedFarms ?? []), ...normalizedFarms.finishedStakedFarms],
    }))
  }

  const changeFarmsSubscriptionList = useCallback((newSkips: Partial<FarmsProviderSubsType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }, [])

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

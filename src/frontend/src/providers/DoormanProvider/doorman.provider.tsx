import React, { useContext, useMemo, useState } from 'react'

// helpers
import { getDoormanProviderReturnValue } from './helpers/doorman.utils'
import { normalizeDoormanChartsData } from './helpers/doormanCharts.normalizer'
import { convertNumberForClient } from 'utils/calcFunctions'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// types
import { DoormanContext, NullableDoormanContextStateType, DoormanSubsRecordType } from './doorman.provider.types'
import { SmvkMvkHistoryDataQuery, GetDappSmvkMvkStatsQuery } from 'utils/__generated__/graphql'
import { ChartPeriodType } from 'types/charts.type'

// consts
import { MVK_DECIMALS } from 'utils/constants'
import { DEFAULT_STAKING_CTX, DAPP_MVK_SMVK_STATS_SUB, DEFAULT_STAKING_ACTIVE_SUBS } from './helpers/doorman.consts'
import { DAPP_MVK_SMVK_STATS } from './queries/doorman.query'

export const doormanContext = React.createContext<DoormanContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const DoormanProvider = ({ children }: Props) => {
  const { handleApolloError } = useApolloContext()
  const {
    contractAddresses: { doormanAddress },
  } = useDappConfigContext()

  const [stakingCtxState, setStakingCtxState] = useState<NullableDoormanContextStateType>(DEFAULT_STAKING_CTX)
  const [activeSubs, setActiveSubs] = useState<DoormanSubsRecordType>(DEFAULT_STAKING_ACTIVE_SUBS)

  // subscribes
  useQueryWithRefetch(DAPP_MVK_SMVK_STATS, {
    skip: !activeSubs[DAPP_MVK_SMVK_STATS_SUB] || !doormanAddress,
    variables: {
      doormanContractAddress: doormanAddress,
    },
    onCompleted: (data) => updateMvkSmvkStats(data),
    onError: (error) => handleApolloError(error, 'DAPP_MVK_SMVK_STATS_SUB'),
  })

  // methods to update context data
  const updateStakeHistoryData = (historyData: SmvkMvkHistoryDataQuery, period: ChartPeriodType) => {
    const { smvkHistoryData, mvkHistoryData, noChartData } = normalizeDoormanChartsData(historyData, period)

    setStakingCtxState((prevState) => ({
      ...prevState,
      smvkHistoryData: { ...prevState.smvkHistoryData, [period]: smvkHistoryData },
      mvkHistoryData: { ...prevState.mvkHistoryData, [period]: mvkHistoryData },
      noChartData,
    }))
  }

  const updateMvkSmvkStats = (storage: GetDappSmvkMvkStatsQuery) => {
    const {
      mavryk_user: [doormanContractBalances],
      mvk_token: [mvkTokenData],
    } = storage
    setStakingCtxState((prevState) => ({
      ...prevState,
      totalStakedMvk: convertNumberForClient({
        number: doormanContractBalances?.mvk_balance ?? 0,
        grade: MVK_DECIMALS,
      }),
      totalSupply: convertNumberForClient({ number: mvkTokenData?.total_supply ?? 0, grade: MVK_DECIMALS }),
      maximumTotalSupply: convertNumberForClient({ number: mvkTokenData?.maximum_supply ?? 0, grade: MVK_DECIMALS }),
    }))
  }

  const changeStakingSubscriptionsList = (newSkips: Partial<DoormanSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }

  const contextProviderValue = useMemo(
    () =>
      getDoormanProviderReturnValue({
        stakingCtxState,
        changeStakingSubscriptionsList,
        activeSubs,
        updateStakeHistoryData,
      }),
    [activeSubs, stakingCtxState],
  )

  return <doormanContext.Provider value={contextProviderValue}>{children}</doormanContext.Provider>
}

export const useDoormanContext = () => {
  const context = useContext(doormanContext)

  if (!context) {
    throw new Error('useDoormanContext should be used within DoormanProvider')
  }

  return context
}

export default DoormanProvider

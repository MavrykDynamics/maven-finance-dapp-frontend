import React, { useCallback, useContext, useMemo, useState } from 'react'

// helpers
import { getDoormanProviderReturnValue } from './helpers/doorman.utils'
import { normalizeDoormanChartsData } from './helpers/doormanCharts.normalizer'
import { convertNumberForClient } from 'utils/calcFunctions'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { useGraphQLQuery } from 'providers/QueryProvider/useGraphQLQuery'

// types
import { DoormanContext, DoormanSubsRecordType, NullableDoormanContextStateType } from './doorman.provider.types'
import { GetDappSmvnMvnStatsQuery, SmvnMvnHistoryDataQuery } from 'utils/__generated__/graphql'
import { ChartPeriodType } from 'types/charts.type'

// consts
import { MVN_DECIMALS } from 'utils/constants'
import { DAPP_MVN_SMVN_STATS_SUB, DEFAULT_STAKING_ACTIVE_SUBS, DEFAULT_STAKING_CTX } from './helpers/doorman.consts'
import { DAPP_MVN_SMVN_STATS } from './queries/doorman.query'

export const doormanContext = React.createContext<DoormanContext>(undefined!)

type Props = {
  children: React.ReactNode
}

const DoormanProvider = ({ children }: Props) => {
  const { handleQueryError } = useQueryProvider()
  const {
    contractAddresses: { doormanAddress },
  } = useDappConfigContext()

  const [stakingCtxState, setStakingCtxState] = useState<NullableDoormanContextStateType>(DEFAULT_STAKING_CTX)
  const [activeSubs, setActiveSubs] = useState<DoormanSubsRecordType>(DEFAULT_STAKING_ACTIVE_SUBS)

  // subscribes
  useGraphQLQuery(DAPP_MVN_SMVN_STATS, {
    skip: !activeSubs[DAPP_MVN_SMVN_STATS_SUB] || !doormanAddress,
    variables: {
      doormanContractAddress: doormanAddress,
    },
    onCompleted: (data) => updateMvnSmvnStats(data),
    onError: (error) => handleQueryError(error, 'DAPP_MVN_SMVN_STATS_SUB'),
  })

  // methods to update context data
  const updateStakeHistoryData = useCallback((historyData: SmvnMvnHistoryDataQuery, period: ChartPeriodType) => {
    const { smvnHistoryData, mvnHistoryData, noChartData } = normalizeDoormanChartsData(historyData, period)

    setStakingCtxState((prevState) => ({
      ...prevState,
      smvnHistoryData: { ...prevState.smvnHistoryData, [period]: smvnHistoryData },
      mvnHistoryData: { ...prevState.mvnHistoryData, [period]: mvnHistoryData },
      noChartData,
    }))
  }, [])

  const updateMvnSmvnStats = (storage: GetDappSmvnMvnStatsQuery) => {
    const {
      maven_user: [doormanContractBalances],
      mvn_token: [mvnTokenData],
    } = storage
    setStakingCtxState((prevState) => ({
      ...prevState,
      totalStakedMvn: convertNumberForClient({
        number: doormanContractBalances?.mvn_balance ?? 0,
        grade: MVN_DECIMALS,
      }),
      totalSupply: convertNumberForClient({ number: mvnTokenData?.total_supply ?? 0, grade: MVN_DECIMALS }),
      maximumTotalSupply: convertNumberForClient({
        number: mvnTokenData?.maximum_supply ?? 0,
        grade: MVN_DECIMALS,
      }),
    }))
  }

  const changeStakingSubscriptionsList = useCallback((newSkips: Partial<DoormanSubsRecordType>) => {
    setActiveSubs((prev) => ({ ...prev, ...newSkips }))
  }, [])

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

import { useState } from 'react'
import { useSubscription } from '@apollo/client'

import { calcWithoutPrecision } from 'utils/calcFunctions'

import { SatellitesStatisticsSubsSkipsType } from '../satellites.provider.types'
import {
  ORACLES_COUNT_STAT,
  ACTIVE_SATELLITES_COUNT_STAT,
  SATELLITES_TOTAL_SMVK_NUMBERS,
  ORACLES_TOTAL_REWARD,
} from '../queries/satellitesStats.query'

export const useSatelliteStatistics = (
  {
    skipOracleCount,
    skipActiveSatellitesCount,
    skipTotalDelegatedMVK,
    skipOracleRewardsTotal,
  }: SatellitesStatisticsSubsSkipsType = {
    skipOracleCount: false,
    skipActiveSatellitesCount: false,
    skipTotalDelegatedMVK: false,
    skipOracleRewardsTotal: false,
  },
) => {
  const [storage, setStorage] = useState({
    totalActiveSatellites: 0,
    totalOracleNetworks: 0,
    totalDelegatedMVK: 0,
    oracleRewardsTotal: 0,
  })

  const { loading: isOracleRewardsLoading } = useSubscription(ORACLES_TOTAL_REWARD, {
    onData: ({ data: response }) => {
      const { data } = response
      if (data)
        setStorage({
          ...storage,
          oracleRewardsTotal: calcWithoutPrecision(data.aggregator_oracle_reward_aggregate.aggregate?.sum?.reward ?? 0),
        })
    },
    skip: skipOracleRewardsTotal,
    shouldResubscribe: true,
  })

  const { loading: isCountLoading } = useSubscription(ORACLES_COUNT_STAT, {
    onData: ({ data: response }) => {
      const { data } = response

      if (data) {
        setStorage({ ...storage, totalOracleNetworks: data.satellite_aggregate.aggregate?.count ?? 0 })
      }
    },
    skip: skipOracleCount,
    shouldResubscribe: true,
  })

  const { loading: isActiveSatellitesCountLoading } = useSubscription(ACTIVE_SATELLITES_COUNT_STAT, {
    onData: ({ data: response }) => {
      const { data } = response

      if (data) {
        setStorage({ ...storage, totalActiveSatellites: data.satellite_aggregate.aggregate?.count ?? 0 })
      }
    },
    skip: skipActiveSatellitesCount,
    shouldResubscribe: true,
  })

  const { loading: isTotalSmvkLoading } = useSubscription(SATELLITES_TOTAL_SMVK_NUMBERS, {
    onData: ({ data: response }) => {
      const { data } = response

      if (data) {
        const totalDelegatedMVK = data.satellite_aggregate.nodes.reduce((acc, node) => {
          const satelliteTotalDelegatedAmount =
            node.delegations.length > 0
              ? node.delegations.reduce((sum, current) => sum + Number(current.user.smvk_balance), 0)
              : 0
          acc += Number(node.user.smvk_balance + satelliteTotalDelegatedAmount)
          return acc
        }, 0)

        setStorage({ ...storage, totalDelegatedMVK: calcWithoutPrecision(totalDelegatedMVK) })
      }
    },
    skip: skipTotalDelegatedMVK,
    shouldResubscribe: true,
  })

  return {
    ...storage,
    isLoading: isCountLoading || isActiveSatellitesCountLoading || isTotalSmvkLoading || isOracleRewardsLoading,
  }
}

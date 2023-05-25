import { useState } from 'react'
import { useSubscription } from '@apollo/client'
import { ORACLES_COUNT_STAT, ACTIVE_SATELLITES_COUNT_STAT, SATELLITES_TOTAL_SMVK_NUMBERS } from 'gql/queries'
import { calcWithoutPrecision } from 'utils/calcFunctions'

type Options = {
  skipOracleCount?: boolean
  skipActiveSatellitesCount?: boolean
  skipTotalDelegatedMVK?: boolean
}

export const useSatelliteStatistics = (options: Options = {}) => {
  const { skipOracleCount = false, skipActiveSatellitesCount = false, skipTotalDelegatedMVK = false } = options

  const [storage, setStorage] = useState({
    totalActiveSatellites: 0,
    totalOracleNetworks: 0,
    totalDelegatedMVK: 0,
  })

  useSubscription(ORACLES_COUNT_STAT, {
    onData: ({ data: response }) => {
      const { data } = response

      if (data) {
        console.log('yes')
        setStorage({ ...storage, totalOracleNetworks: data.satellite_aggregate.aggregate?.count ?? 0 })
      }
    },
    skip: skipOracleCount,
    shouldResubscribe: true,
  })

  useSubscription(ACTIVE_SATELLITES_COUNT_STAT, {
    onData: ({ data: response }) => {
      const { data } = response

      if (data) {
        console.log('no')
        setStorage({ ...storage, totalActiveSatellites: data.satellite_aggregate.aggregate?.count ?? 0 })
      }
    },
    skip: skipActiveSatellitesCount,
    shouldResubscribe: true,
  })

  useSubscription(SATELLITES_TOTAL_SMVK_NUMBERS, {
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

  return { ...storage }
}

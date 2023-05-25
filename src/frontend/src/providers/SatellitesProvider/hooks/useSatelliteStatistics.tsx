import { useState } from 'react'
import { useSubscription } from '@apollo/client'
import { ORACLES_COUNT_STAT, ACTIVE_SATELLITES_COUNT_STAT, SATELLITES_TOTAL_SMVK_NUMBERS } from 'gql/queries'
import { calcWithoutPrecision } from 'utils/calcFunctions'

export const useSatelliteStatistics = () => {
  const [storage, setStorage] = useState({
    totalActiveSatellites: 0,
    totalOracleNetworks: 0,
    totalDelegatedMVK: 0,
  })

  useSubscription(ORACLES_COUNT_STAT, {
    onData: ({ data: response }) => {
      const { data } = response

      if (data) {
        setStorage({ ...storage, totalOracleNetworks: data.satellite_aggregate.aggregate?.count ?? 0 })
      }
    },
  })

  useSubscription(ACTIVE_SATELLITES_COUNT_STAT, {
    onData: ({ data: response }) => {
      const { data } = response

      if (data) {
        setStorage({ ...storage, totalActiveSatellites: data.satellite_aggregate.aggregate?.count ?? 0 })
      }
    },
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
  })

  return { ...storage }
}

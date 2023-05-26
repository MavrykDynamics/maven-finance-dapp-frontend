import { useEffect, useState } from 'react'
import { useSubscription } from '@apollo/client'
import { ORACLES_COUNT_STAT, ACTIVE_SATELLITES_COUNT_STAT, SATELLITES_TOTAL_SMVK_NUMBERS } from 'gql/queries'
import { calcWithoutPrecision } from 'utils/calcFunctions'
import { SUB_QUERY, SUB_SKIP, SUB_SUBSCRIBE } from 'utils/api/apollo.consts'
import { SatellitesStatisticsSubsSkipsType } from '../satellites.provider.types'

export const useSatelliteStatistics = (
  { skipOracleCount, skipActiveSatellitesCount, skipTotalDelegatedMVK }: SatellitesStatisticsSubsSkipsType = {
    skipOracleCount: SUB_SUBSCRIBE,
    skipActiveSatellitesCount: SUB_SUBSCRIBE,
    skipTotalDelegatedMVK: SUB_SUBSCRIBE,
  },
) => {
  const [storage, setStorage] = useState({
    totalActiveSatellites: 0,
    totalOracleNetworks: 0,
    totalDelegatedMVK: 0,
  })

  const [shouldSkip, setShouldSkip] = useState<SatellitesStatisticsSubsSkipsType>({
    skipOracleCount,
    skipActiveSatellitesCount,
    skipTotalDelegatedMVK,
  })

  const { loading: isCountLoading } = useSubscription(ORACLES_COUNT_STAT, {
    onData: ({ data: response }) => {
      const { data } = response

      if (data) {
        setStorage({ ...storage, totalOracleNetworks: data.satellite_aggregate.aggregate?.count ?? 0 })
      }
    },
    skip: shouldSkip.skipOracleCount === SUB_SKIP,
    shouldResubscribe: true,
  })

  const { loading: isActiveSatellitesCountLoading } = useSubscription(ACTIVE_SATELLITES_COUNT_STAT, {
    onData: ({ data: response }) => {
      const { data } = response

      if (data) {
        setStorage({ ...storage, totalActiveSatellites: data.satellite_aggregate.aggregate?.count ?? 0 })
      }
    },
    skip: shouldSkip.skipActiveSatellitesCount === SUB_SKIP,
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
    skip: shouldSkip.skipTotalDelegatedMVK === SUB_SKIP,
    shouldResubscribe: true,
  })

  const isStorageLoaded = !isCountLoading && !isActiveSatellitesCountLoading && !isTotalSmvkLoading
  // Effect to load data 1 time and then skip loading, cuz loading returned from useSubscription so only for initial loading
  useEffect(() => {
    if (isStorageLoaded && skipOracleCount === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipOracleCount: SUB_SKIP,
      }))
    }

    if (isStorageLoaded && skipActiveSatellitesCount === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipActiveSatellitesCount: SUB_SKIP,
      }))
    }
    if (isStorageLoaded && skipTotalDelegatedMVK === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipTotalDelegatedMVK: SUB_SKIP,
      }))
    }
  }, [isStorageLoaded, skipActiveSatellitesCount, skipOracleCount, skipTotalDelegatedMVK])

  return { ...storage }
}

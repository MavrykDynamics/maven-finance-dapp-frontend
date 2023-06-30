import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

import { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'

import { SatelliteRecordType, SatelliteStatuses } from '../satellites.provider.types'

import { OracleStatusTypes } from '../satellites.const'
import { SATELLITE_ACTIVE_STATUS } from '../helpers/satellites.conts'

export const useSatelliteOracleStatus = (satellite: SatelliteRecordType) => {
  const { feedsAddresses, feedsMapper } = useDataFeedsContext()

  const [oracleStatus, setOracleStatus] = useState<OracleStatusTypes>('notAnOracle')

  useEffect(() => {
    const satelliteOracleRecords = satellite.oracleRecords

    if (satelliteOracleRecords.length > 0) {
      if (satellite.status === SATELLITE_ACTIVE_STATUS) {
        const currentFeedsWhereSatelliteAdmin = feedsAddresses.filter(
          (feedAddress) => feedsMapper[feedAddress].admin === satellite.address,
        )

        // if timestamp or all feeds from this satellite is >= than 30m ago, feed is not active,
        // if all feeds are not active oracle status is responded, if at least 1 feed is still active, satellite status is awaiting
        const isAllSatellitesFeedsActive = currentFeedsWhereSatelliteAdmin.every((feedAddress) => {
          const { last_completed_data_last_updated_at, heart_beat_seconds } = feedsMapper[feedAddress]

          const nowAndLastUpdateDiffInMs = dayjs().subtract(dayjs(last_completed_data_last_updated_at).unix()).unix()
          return nowAndLastUpdateDiffInMs / 1000 >= heart_beat_seconds
        })

        setOracleStatus(isAllSatellitesFeedsActive ? 'responded' : 'awaiting')
      } else {
        // if oracle is not active, status should be "no response"
        setOracleStatus('noResponse')
      }
    }
  }, [feedsAddresses, feedsMapper, satellite.address, satellite.oracleRecords, satellite.status])

  return { oracleStatus, satelliteStatus: SatelliteStatuses[satellite.status] }
}

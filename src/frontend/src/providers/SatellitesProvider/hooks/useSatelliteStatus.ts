import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

import { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'

import {
  SatelliteOracleStatusType,
  SatelliteIndexerStatusType,
  SatelliteRecordType,
} from '../satellites.provider.types'

import {
  NOT_AN_ORACLE_ORACLE_STATUS,
  ACTIVE_SATELLITE_STATUS,
  RESPONDED_ORACLE_STATUS,
  AWAITING_ORACLE_STATUS,
  NO_RESPONSE_ORACLE_STATUS,
  INACTIVE_SATELLITE_STATUS,
} from '../satellites.const'

export const useSatelliteStatuses = (
  satellite: SatelliteRecordType | null,
): { oracleStatus: SatelliteOracleStatusType; satelliteStatus: SatelliteIndexerStatusType } => {
  const { feedsAddresses, feedsMapper } = useDataFeedsContext()

  const [oracleStatus, setOracleStatus] = useState<SatelliteOracleStatusType>(NOT_AN_ORACLE_ORACLE_STATUS)

  useEffect(() => {
    if (!satellite) return

    if (Object.keys(satellite.participatedFeeds).length > 0) {
      if (satellite.status === ACTIVE_SATELLITE_STATUS) {
        const currentFeedsWhereSatelliteAdmin = feedsAddresses.filter(
          (feedAddress) => feedsMapper[feedAddress].admin === satellite.address,
        )

        // check whether all feeds are active (diff now and last update should be <= then heartBeat seconds)
        const isAllSatellitesFeedsActive = currentFeedsWhereSatelliteAdmin.every((feedAddress) => {
          const { last_completed_data_last_updated_at, heart_beat_seconds } = feedsMapper[feedAddress]

          const nowAndLastUpdateDiffInMs = dayjs().subtract(dayjs(last_completed_data_last_updated_at).unix()).unix()
          return nowAndLastUpdateDiffInMs / 1000 >= heart_beat_seconds
        })

        // if all feeds are not active oracle status is responded, if at least 1 feed is still active, satellite status is awaiting
        setOracleStatus(isAllSatellitesFeedsActive ? RESPONDED_ORACLE_STATUS : AWAITING_ORACLE_STATUS)
      } else {
        // if oracle is not active, status should be "no response"
        setOracleStatus(NO_RESPONSE_ORACLE_STATUS)
      }
    }
  }, [feedsAddresses, feedsMapper, satellite])

  return {
    oracleStatus,
    satelliteStatus: satellite?.status ?? INACTIVE_SATELLITE_STATUS,
  }
}

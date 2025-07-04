import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

import { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'

import {
  SatelliteIndexerStatusType,
  SatelliteOracleStatusType,
  SatelliteRecordType,
} from '../satellites.provider.types'

import {
  ACTIVE_SATELLITE_STATUS,
  AWAITING_ORACLE_STATUS,
  INACTIVE_SATELLITE_STATUS,
  NO_RESPONSE_ORACLE_STATUS,
  NOT_AN_ORACLE_ORACLE_STATUS,
  RESPONDED_ORACLE_STATUS,
} from '../satellites.const'
import { DataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider.types'
import { TEMP_MAX_ORACLE_DATA_PUSH_SECONDS } from '../../../utils/constants'

export const useSatelliteStatuses = (
  satellite: SatelliteRecordType | null,
  feedAddress?: string,
): { oracleStatus: SatelliteOracleStatusType; satelliteStatus: SatelliteIndexerStatusType } => {
  const { feedsAddresses, feedsMapper } = useDataFeedsContext()

  const [oracleStatus, setOracleStatus] = useState<SatelliteOracleStatusType>(NOT_AN_ORACLE_ORACLE_STATUS)

  useEffect(() => {
    if (!satellite) return

    const intervalId = setInterval(() => {
      if (Object.keys(satellite.participatedFeeds).length > 0) {
        if (satellite.status === ACTIVE_SATELLITE_STATUS) {
          const currentFeedsWhereSatelliteParticipating = getFeedsWhereSatelliteParticipated({
            feedsAddresses,
            feedsMapper,
            specificFeedAddress: feedAddress,
            satelliteAddress: satellite.address,
          })

          // if satellite is not participated in any feed, he's not an oracle
          if (currentFeedsWhereSatelliteParticipating.length === 0) {
            return setOracleStatus(NOT_AN_ORACLE_ORACLE_STATUS)
          }

          // check whether all feeds are active (diff now and last update should be <= then heartBeat seconds)
          const isAllSatellitesFeedsActive = checkWhetherAlloraclePredictionsActive(
            currentFeedsWhereSatelliteParticipating,
            feedsMapper,
            satellite,
          )

          // if all feeds are not active oracle status is responded, if at least 1 feed is still active, satellite status is awaiting
          return setOracleStatus(isAllSatellitesFeedsActive ? RESPONDED_ORACLE_STATUS : AWAITING_ORACLE_STATUS)
        } else {
          // if oracle is not active, status should be "no response"
          return setOracleStatus(NO_RESPONSE_ORACLE_STATUS)
        }
      }
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [feedsAddresses, feedsMapper, satellite])

  return {
    oracleStatus,
    satelliteStatus: satellite?.status ?? INACTIVE_SATELLITE_STATUS,
  }
}

const getFeedsWhereSatelliteParticipated = ({
  feedsMapper,
  feedsAddresses,
  satelliteAddress,
  specificFeedAddress,
}: {
  feedsMapper: DataFeedsContext['feedsMapper']
  feedsAddresses: Array<string>
  satelliteAddress: string
  specificFeedAddress?: string
}) => {
  if (specificFeedAddress) {
    const isSatelliteOracleInSpecificFeed = feedsMapper[specificFeedAddress].oraclesAddresses.includes(satelliteAddress)
    return isSatelliteOracleInSpecificFeed ? [specificFeedAddress] : []
  }

  return feedsAddresses.filter((feedAddress) => feedsMapper[feedAddress].oraclesAddresses.includes(satelliteAddress))
}

const checkWhetherAlloraclePredictionsActive = (
  currentFeedsWhereSatelliteParticipating: Array<string>,
  feedsMapper: DataFeedsContext['feedsMapper'],
  satellite: SatelliteRecordType,
) => {
  return currentFeedsWhereSatelliteParticipating.every((feedAddress) => {
    const {
      last_completed_data_last_updated_at: feedLastUpdateTime,
      heart_beat_seconds,
      last_completed_data_epoch: latestEpoch,
    } = feedsMapper[feedAddress]
    const { predictionTime, predictionEpoch } = satellite.participatedFeeds[feedAddress] ?? {}

    // TODO: heart_beat_seconds update for new delay. Switch TEMP_MAX_ORACLE_DATA_PUSH_SECONDS back to heart_beat_seconds

    let isValidEpoch = false
    let isValidPredictionGap = false
    if (predictionEpoch !== null && latestEpoch <= predictionEpoch) {
      isValidEpoch = true
    }
    // diff from now to last feed update and now in ms
    // const diffTimeNowAndLastFeedUpdate = dayjs().subtract(dayjs(feedLastUpdateTime).valueOf()).valueOf()

    // diff from last satellite prediction and now in ms
    const diffTimeNowAndLastSatellitePrediction = dayjs(feedLastUpdateTime)
      .subtract(dayjs(predictionTime).valueOf())
      .valueOf()

    isValidPredictionGap = diffTimeNowAndLastSatellitePrediction / 1000 <= TEMP_MAX_ORACLE_DATA_PUSH_SECONDS

    return isValidEpoch || isValidPredictionGap
  })
}

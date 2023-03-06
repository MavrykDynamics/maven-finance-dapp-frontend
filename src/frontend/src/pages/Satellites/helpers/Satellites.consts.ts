import { State } from 'reducers'
import { Feed } from 'utils/TypesAndInterfaces/DataFeeds'
import { SatelliteRecordType } from 'utils/TypesAndInterfaces/Satellites'
import { MavrykTheme } from 'styles/interfaces'

export const ORACLE_STATUSES_MAPPER = {
  responded: 'Responded',
  noResponse: 'No Response',
  awaiting: 'Awaiting',
  notAnOracle: 'Not An Oracle',
}

export type OracleStatusTypes = keyof typeof ORACLE_STATUSES_MAPPER

export const findColorBasedOnStatus = (statusType: OracleStatusTypes, theme: MavrykTheme) => {
  return statusType === 'responded'
    ? theme.upColor
    : statusType === 'noResponse' || statusType === 'notAnOracle'
    ? theme.downColor
    : theme.warningColor
}

export function getTotalDelegatedMVK(
  satelliteIds: State['satellites']['allSatellitesIds'],
  satellitesMapper: State['satellites']['satelliteMapper'],
): number {
  if (!satelliteIds) return 0
  return satelliteIds.reduce(
    (sum, currentAddress) =>
      sum +
      Number(satellitesMapper[currentAddress].totalDelegatedAmount + satellitesMapper[currentAddress].sMvkBalance),
    0,
  )
}

export const getOracleStatus = (oracle: SatelliteRecordType, feeds: Feed[]): OracleStatusTypes => {
  let status: OracleStatusTypes = 'notAnOracle'

  // check if satellite is an oracle
  if (oracle?.oracleRecords?.length > 0) {
    // check whether oracle is active, if true status can be responded or awaiting
    if (oracle.status === 0) {
      const currentOracleFeeds = feeds.filter(({ admin }) => oracle.oracleRecords[0].oracleAddress === admin)

      // if timestamp or all feeds from this satellite is >= than 30m ago, feed is not active, if all feeds are not active oracle status is responded, if at least 1 feed is still active, satellite status is awaiting
      if (
        currentOracleFeeds.every(
          ({ last_completed_data_last_updated_at, heart_beat_seconds }) =>
            (Number(Date.now()) - Number(new Date(last_completed_data_last_updated_at || Date.now()))) / 1000 >=
            heart_beat_seconds,
        )
      ) {
        status = 'responded'
      } else {
        status = 'awaiting'
      }
      // if oracle is not active, status should be "no response"
    } else {
      status = 'noResponse'
    }
  }

  return status
}

export const VOTE_NUM_MAPPER: Record<number, string> = {
  0: 'Pass',
  1: 'Yes',
  2: 'No',
}

export const getVoteText = (voteType?: number): string => {
  if (voteType === 0) return 'Pass'
  if (voteType === 1) return 'Yes'
  if (voteType === 2) return 'No'

  return voteType ? VOTE_NUM_MAPPER[voteType] ?? '' : ''
}

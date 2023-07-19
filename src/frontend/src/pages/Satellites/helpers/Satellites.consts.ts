import { State } from 'reducers'
import { Feed } from 'utils/TypesAndInterfaces/DataFeeds'
import { SatelliteRecordGraphQl, SatelliteRecordType } from 'utils/TypesAndInterfaces/Satellites'
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
  satelliteIds: State['satellites']['activeSatellitesIds'],
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

export const VOTE_NUM_MAPPER: Record<number, string> = {
  0: 'PASS',
  1: 'YES',
  2: 'NO',
}

export const getVoteText = (voteType?: number): string => {
  if (voteType === 0) return 'PASS'
  if (voteType === 1) return 'YES'
  if (voteType === 2) return 'NO'

  return voteType ? VOTE_NUM_MAPPER[voteType] ?? '' : ''
}

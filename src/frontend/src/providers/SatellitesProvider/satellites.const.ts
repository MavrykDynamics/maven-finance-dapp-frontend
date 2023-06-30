import { MavrykTheme } from 'styles/interfaces'
import { SatelliteRecordType } from 'providers/SatellitesProvider/satellites.provider.types'

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
  satelliteIds: Array<SatelliteRecordType['address']>,
  satellitesMapper: Record<string, SatelliteRecordType>,
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
  0: 'Pass',
  1: 'Yes',
  2: 'No',
} as const

export const getVoteText = (voteType?: number): string => {
  if (voteType === 0) return 'Pass'
  if (voteType === 1) return 'Yes'
  if (voteType === 2) return 'No'

  return voteType ? VOTE_NUM_MAPPER[voteType] ?? '' : ''
}

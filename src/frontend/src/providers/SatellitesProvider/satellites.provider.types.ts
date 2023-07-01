import { z } from 'zod'
import { normallizeSatellite } from './helpers/satellites.normalizer'

import { TokenType } from 'utils/TypesAndInterfaces/General'

export type SatelliteRecordType = NonNullable<ReturnType<typeof normallizeSatellite>>
export type SatelliteMapper = Record<string, SatelliteRecordType>

export type SatellitesContext = {
  // data
  satelliteMapper: SatelliteMapper
  activeSatellitesIds: string[]
  allSatellitesIds: string[]
  oraclesIds: string[]

  // values to calc satellite metrix
  proposalsAmount: number
  executedProposalAmount: number
  finRequestsAmount: number
  eGovProposalsAmount: number

  // additional data
  isLoading: boolean

  // api
  setSatelliteAddressToSubsctibe: (satelliteAddress: string | null) => void
}

export type SatellitesCtxState = Pick<
  SatellitesContext,
  | 'satelliteMapper'
  | 'activeSatellitesIds'
  | 'allSatellitesIds'
  | 'oraclesIds'
  | 'proposalsAmount'
  | 'eGovProposalsAmount'
  | 'executedProposalAmount'
  | 'finRequestsAmount'
>

// Satellite status
export const ACTIVE_SATELLITE_STATUS = 0
export const SUSPENDED_SATELLITE_STATUS = 1
export const BANNED_SATELLITE_STATUS = 2
export const INACTIVE_SATELLITE_STATUS = 3
export const satelliteStatusSchema = z.literal(0).or(z.literal(1)).or(z.literal(2)).or(z.literal(3))
export type SatelliteIndexerStatusType = z.infer<typeof satelliteStatusSchema>
export type SatelliteConvertedIndexerStatusType = (typeof SATELLITE_STATUSES)[keyof typeof SATELLITE_STATUSES]

export const SATELLITE_STATUSES = {
  [ACTIVE_SATELLITE_STATUS]: 'ACTIVE',
  [SUSPENDED_SATELLITE_STATUS]: 'SUSPENDED',
  [BANNED_SATELLITE_STATUS]: 'BANNED',
  [INACTIVE_SATELLITE_STATUS]: 'INACTIVE',
} as const

// Satellite Oracle Status
export const RESPONDED_ORACLE_STATUS = 'responded'
export const NO_RESPONSE_ORACLE_STATUS = 'noResponse'
export const AWAITING_ORACLE_STATUS = 'Awaiting'
export const NOT_AN_ORACLE_ORACLE_STATUS = 'notAnOracle'
export type SatelliteOracleStatusType = keyof typeof SATELLITE_ORACLE_STATUSES
export type SatelliteConvertedOracleStatusType =
  (typeof SATELLITE_ORACLE_STATUSES)[keyof typeof SATELLITE_ORACLE_STATUSES]

export const SATELLITE_ORACLE_STATUSES = {
  [RESPONDED_ORACLE_STATUS]: 'Responded',
  [NO_RESPONSE_ORACLE_STATUS]: 'No Response',
  [AWAITING_ORACLE_STATUS]: 'Awaiting',
  [NOT_AN_ORACLE_ORACLE_STATUS]: 'Not An Oracle',
} as const

// Satellite votes
export const SATELLITE_VOTE_PASS = 0
export const SATELLITE_VOTE_YES = 1
export const SATELLITE_VOTE_NO = 2
export const satelliteVoteSchema = z.literal(0).or(z.literal(1)).or(z.literal(2))
export type SatelliteVoteType = z.infer<typeof satelliteVoteSchema>

export const SATELLITE_VOTES_MAPPER = {
  [SATELLITE_VOTE_PASS]: 'Pass',
  [SATELLITE_VOTE_YES]: 'Yes',
  [SATELLITE_VOTE_NO]: 'No',
} as const

export type SatelliteVoteItemType = {
  id: number
  timestamp: number
  vote: SatelliteVoteType
  voteName: string
}

export type SatelliteGovernanceTransfer = {
  to_: string //this is a contract address
  amount: number
  token: TokenType
}

export type SatellitesSubsSkipsType = {
  skipSatelliteData?: string
  skipGovProposal?: string
  skipEmergencyGov?: string
  skipFinancialRequest?: string
  skipAggregatorOracles?: string
  skipSatelliteCycle?: string
}

export type SatellitesStatisticsSubsSkipsType = {
  skipOracleCount?: boolean
  skipActiveSatellitesCount?: boolean
  skipTotalDelegatedMVK?: boolean
  skipOracleRewardsTotal?: boolean
}

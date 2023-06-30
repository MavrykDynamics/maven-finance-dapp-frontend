import { getSatelliteVotings, normallizeSatellite } from './helpers/satellites.normalizer'

import { TokenType } from 'utils/TypesAndInterfaces/General'

export type SatelliteRecordType = ReturnType<typeof normallizeSatellite>
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
export type SatelliteIndexerStatusType = keyof typeof SatelliteStatuses

export const SatelliteStatuses = {
  [ACTIVE_SATELLITE_STATUS]: 'ACTIVE',
  [SUSPENDED_SATELLITE_STATUS]: 'SUSPENDED',
  [BANNED_SATELLITE_STATUS]: 'BANNED',
  [INACTIVE_SATELLITE_STATUS]: 'INACTIVE',
} as const

// Satellite votes
export type SatelliteVotingsType = ReturnType<typeof getSatelliteVotings>
export type SatelliteVoteType =
  | SatelliteVotingsType['satelliteActionVotes'][number]
  | SatelliteVotingsType['eGovVotes'][number]
  | SatelliteVotingsType['financialRequestsVotes'][number]
  | SatelliteVotingsType['proposalsVotes'][number]

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
  skipOracleCount?: string
  skipActiveSatellitesCount?: string
  skipTotalDelegatedMVK?: string
}

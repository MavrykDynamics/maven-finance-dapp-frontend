import { z } from 'zod'
import { normalizeSatelliteVotings, normallizeSatellite } from './helpers/satellites.normalizer'

import { TokenType } from 'utils/TypesAndInterfaces/General'

import {
  INACTIVE_SATELLITE_STATUS,
  satelliteStatusSchema,
  satelliteVoteSchema,
  SATELLITE_ORACLE_STATUSES,
  SATELLITE_STATUSES,
} from './satellites.const'

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
  satelliteGovActionsAmount: number
  finRequestsAmount: number

  // additional data
  isLoading: boolean

  // api
  setSatelliteAddressToSubsctibe: (satelliteAddress: string) => void
}

export type SatellitesCtxState = Pick<
  SatellitesContext,
  | 'satelliteMapper'
  | 'activeSatellitesIds'
  | 'allSatellitesIds'
  | 'oraclesIds'
  | 'proposalsAmount'
  | 'satelliteGovActionsAmount'
  | 'finRequestsAmount'
>

// Satellite status
export type SatelliteIndexerStatusType = z.infer<typeof satelliteStatusSchema> | typeof INACTIVE_SATELLITE_STATUS
export type SatelliteConvertedIndexerStatusType = (typeof SATELLITE_STATUSES)[keyof typeof SATELLITE_STATUSES]

// Satellite Oracle Status
export type SatelliteOracleStatusType = keyof typeof SATELLITE_ORACLE_STATUSES
export type SatelliteConvertedOracleStatusType =
  (typeof SATELLITE_ORACLE_STATUSES)[keyof typeof SATELLITE_ORACLE_STATUSES]

// Satellite votes
export type SatelliteVoteType = z.infer<typeof satelliteVoteSchema>
export type SatelliteVotesType = ReturnType<typeof normalizeSatelliteVotings>

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

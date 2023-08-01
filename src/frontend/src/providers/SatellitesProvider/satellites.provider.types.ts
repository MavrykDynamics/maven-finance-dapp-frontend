import { z } from 'zod'
import { normalizeSatelliteVotings, normallizeSatellite } from './helpers/satellites.normalizer'

import { TokenType } from 'utils/TypesAndInterfaces/General'

import {
  INACTIVE_SATELLITE_STATUS,
  satelliteStatusSchema,
  satelliteVoteSchema,
  SATELLITE_ORACLE_STATUSES,
  SATELLITE_STATUSES,
  SATELLITE_DATA_SUB,
  SATELLITE_PARTICIPATION_DATA_SUB,
  DELEGATE_ACTION,
  UNDELEGATE_ACTION,
  DISTRIBUTE_PROPOSALS_REWARDS_ACTION,
  REGISTER_SATELLITE_ACTION,
  UNREGISTER_SATELLITE_ACTION,
  UPDATE_SATELLITE_ACTION,
  SATELLITES_DATA_ACTIVE_SUB,
  SATELLITES_DATA_ALL_SUB,
  SATELLITES_DATA_ORACLES_SUB,
  SATELLITE_ALL_ADDRESSES_SUB,
  SATELLITES_DATA_SINGLE_SUB,
} from './satellites.const'

export type SatelliteRecordType = NonNullable<ReturnType<typeof normallizeSatellite>>
export type SatelliteMapper = Record<string, SatelliteRecordType>

export type SatellitesContextState = {
  // data
  satelliteMapper: SatelliteMapper | null
  activeSatellitesIds: string[] | null
  allSatellitesIds: string[] | null
  oraclesIds: string[] | null

  // values to calc satellite metrix
  proposalsAmount: number | null
  satelliteGovActionsAmount: number | null
  finRequestsAmount: number | null
}

export type SatellitesContext = DeepNonNullable<SatellitesContextState> & {
  isLoading: boolean

  // api
  setSatelliteAddressToSubsctibe: (satelliteAddress: string | null) => void
  changeSatellitesSubscriptionsList: (skips: Partial<SatellitesSubsRecordType>) => void
}

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

export type SatellitesStatisticsSubsSkipsType = {
  skipOracleCount?: boolean
  skipActiveSatellitesCount?: boolean
  skipTotalDelegatedMVK?: boolean
  skipOracleRewardsTotal?: boolean
}

export type SatellitesDataDubsType =
  | typeof SATELLITES_DATA_ACTIVE_SUB
  | typeof SATELLITES_DATA_ALL_SUB
  | typeof SATELLITES_DATA_ORACLES_SUB
  | typeof SATELLITES_DATA_SINGLE_SUB
  | null
export type SatellitesSubsRecordType = {
  [SATELLITE_DATA_SUB]: SatellitesDataDubsType
  [SATELLITE_PARTICIPATION_DATA_SUB]: boolean
  [SATELLITE_ALL_ADDRESSES_SUB]: boolean
}

export type SatelliteActionsType =
  | typeof DELEGATE_ACTION
  | typeof UNDELEGATE_ACTION
  | typeof DISTRIBUTE_PROPOSALS_REWARDS_ACTION
  | typeof REGISTER_SATELLITE_ACTION
  | typeof UNREGISTER_SATELLITE_ACTION
  | typeof UPDATE_SATELLITE_ACTION

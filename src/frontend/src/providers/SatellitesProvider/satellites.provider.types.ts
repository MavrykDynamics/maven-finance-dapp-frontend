import {z} from 'zod'

import {
  ActiveSatellitesDataQueryQuery,
  AllSatellitesDataQueryQuery,
  OraclesSatellitesDataQueryQuery,
  SatelliteDataQueryQuery,
} from './../../utils/__generated__/graphql'

import {normalizeSatellite, normalizeSatelliteVotes} from './helpers/satellites.normalizer'

import {
  DELEGATE_ACTION,
  DISTRIBUTE_PROPOSALS_REWARDS_ACTION,
  INACTIVE_SATELLITE_STATUS,
  REGISTER_SATELLITE_ACTION,
  SATELLITE_DATA_SUB,
  SATELLITE_ORACLE_STATUSES,
  SATELLITE_PARTICIPATION_DATA_SUB,
  SATELLITE_STATUSES,
  SATELLITES_DATA_ACTIVE_SUB,
  SATELLITES_DATA_ALL_SUB,
  SATELLITES_DATA_ORACLES_SUB,
  SATELLITES_DATA_SINGLE_SUB,
  satelliteStatusSchema,
  satelliteVoteSchema,
  UNDELEGATE_ACTION,
  UNREGISTER_SATELLITE_ACTION,
  UPDATE_SATELLITE_ACTION,
} from './satellites.const'

// ------- context types
export type SatellitesContextState = {
  // data
  satelliteMapper: SatelliteMapper
  activeSatellitesIds: string[]
  allSatellitesIds: string[]
  oraclesIds: string[]

  // values to calc satellite metrics
  proposalsAmount: number
  satelliteGovActionsAmount: number
  finRequestsAmount: number
}

export type SatellitesContext = SatellitesContextState & {
  isLoading: boolean

  // api
  setSatelliteAddressToSubscribe: (satelliteAddress: string | null) => void
  changeSatellitesSubscriptionsList: (skips: Partial<SatellitesSubsRecordType>) => void
}

export type SatellitesIndexerDataType =
  | SatelliteDataQueryQuery
  | ActiveSatellitesDataQueryQuery
  | AllSatellitesDataQueryQuery
  | OraclesSatellitesDataQueryQuery

// ------- subs types
export type SatellitesDataSubsType =
  | typeof SATELLITES_DATA_ACTIVE_SUB
  | typeof SATELLITES_DATA_ALL_SUB
  | typeof SATELLITES_DATA_ORACLES_SUB
  | typeof SATELLITES_DATA_SINGLE_SUB
  | null
export type SatellitesSubsRecordType = {
  [SATELLITE_DATA_SUB]: SatellitesDataSubsType
  [SATELLITE_PARTICIPATION_DATA_SUB]: boolean
}

// ------- satellite general types
export type SatelliteRecordType = NonNullable<ReturnType<typeof normalizeSatellite>>
export type SatelliteMapper = Record<string, SatelliteRecordType>

// Satellite status
export type SatelliteIndexerStatusType = z.infer<typeof satelliteStatusSchema> | typeof INACTIVE_SATELLITE_STATUS
export type SatelliteConvertedIndexerStatusType = (typeof SATELLITE_STATUSES)[keyof typeof SATELLITE_STATUSES]

// Satellite Oracle Status
export type SatelliteOracleStatusType = keyof typeof SATELLITE_ORACLE_STATUSES
export type SatelliteConvertedOracleStatusType =
  (typeof SATELLITE_ORACLE_STATUSES)[keyof typeof SATELLITE_ORACLE_STATUSES]

// Satellite votes
export type SatelliteVoteType = z.infer<typeof satelliteVoteSchema>
export type SatelliteVotesType = ReturnType<typeof normalizeSatelliteVotes>

export type SatelliteActionsType =
  | typeof DELEGATE_ACTION
  | typeof UNDELEGATE_ACTION
  | typeof DISTRIBUTE_PROPOSALS_REWARDS_ACTION
  | typeof REGISTER_SATELLITE_ACTION
  | typeof UNREGISTER_SATELLITE_ACTION
  | typeof UPDATE_SATELLITE_ACTION

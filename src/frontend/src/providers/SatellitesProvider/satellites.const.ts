import { z } from 'zod'
import { SatellitesContextState } from './satellites.provider.types'

// actions
export const DELEGATE_ACTION = 'delegate'
export const UNDELEGATE_ACTION = 'undelegate'
export const DISTRIBUTE_PROPOSALS_REWARDS_ACTION = 'distributeProposalRewards'
export const REGISTER_SATELLITE_ACTION = 'registerSatellite'
export const UNREGISTER_SATELLITE_ACTION = 'unregisterSatellite'
export const UPDATE_SATELLITE_ACTION = 'updateSatellite'

// Satellite status
export const ACTIVE_SATELLITE_STATUS = 0
export const SUSPENDED_SATELLITE_STATUS = 1
export const BANNED_SATELLITE_STATUS = 2
export const INACTIVE_SATELLITE_STATUS = 3
export const satelliteStatusSchema = z
  .literal(ACTIVE_SATELLITE_STATUS)
  .or(z.literal(SUSPENDED_SATELLITE_STATUS))
  .or(z.literal(BANNED_SATELLITE_STATUS))

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
export const satelliteVoteSchema = z
  .literal(SATELLITE_VOTE_PASS)
  .or(z.literal(SATELLITE_VOTE_YES))
  .or(z.literal(SATELLITE_VOTE_NO))

export const SATELLITE_VOTES_MAPPER = {
  [SATELLITE_VOTE_PASS]: 'Pass',
  [SATELLITE_VOTE_YES]: 'Yes',
  [SATELLITE_VOTE_NO]: 'No',
} as const

// Subs
export const SATELLITE_DATA_SUB = 'SATELLITE_DATA_SUB'
export const SATELLITES_DATA_ALL_SUB = 'SATELLITES_DATA_ALL_SUB'
export const SATELLITES_DATA_SINGLE_SUB = 'SATELLITES_DATA_SINGLE_SUB'
export const SATELLITES_DATA_ACTIVE_SUB = 'SATELLITES_DATA_ACTIVE_SUB'
export const SATELLITES_DATA_ORACLES_SUB = 'SATELLITES_DATA_ORACLES_SUB'
export const SATELLITE_PARTICIPATION_DATA_SUB = 'SATELLITE_PARTICIPATION_DATA_SUB'

export const DEFAULT_SATELLITES_ACTIVE_SUBS = {
  [SATELLITE_DATA_SUB]: null,
  [SATELLITE_PARTICIPATION_DATA_SUB]: false,
}

// context data
export const DEFAULT_SATELLITES_CONTEXT: DeepNullable<SatellitesContextState> = {
  satelliteMapper: null,
  satelliteActiveMapper: null,
  satelliteOraclesMapper: null,
  activeSatellitesIds: null,
  allSatellitesIds: null,
  oraclesIds: null,
  proposalsAmount: null,
  satelliteGovActionsAmount: null,
  finRequestsAmount: null,
  changePage: () => {},
  totalSatellitesCount: null,
  satelliteMapperByAddress: null,
  staelliteIdsByAddress: null,
}

export const EMPTY_SATELLITES_CONTEXT: SatellitesContextState = {
  satelliteMapper: {},
  satelliteActiveMapper: {},
  satelliteOraclesMapper: {},
  activeSatellitesIds: [],
  allSatellitesIds: [],
  oraclesIds: [],
  proposalsAmount: 0,
  satelliteGovActionsAmount: 0,
  finRequestsAmount: 0,
  changePage: () => {},
  totalSatellitesCount: 0,
  satelliteMapperByAddress: {},
  staelliteIdsByAddress: [],
}

// Filters & pagination ----------
export const SATELLITES_LIMIT = 5
export const SATELLITE_PAGINATION_ALL = 'SATELLITE_PAGINATION_ALL'
export const SATELLITE_PAGINATION_ACTIVE = 'SATELLITE_PAGINATION_ACTIVE'
export const SATELLITE_PAGINATION_ORACLES = 'SATELLITE_PAGINATION_ORACLES'
export const SATELLITE_PAGINATION_BY_ADDRESS = 'SATELLITE_PAGINATION_BY_ADDRESS'

export type PaginationSatelliteType =
  | typeof SATELLITE_PAGINATION_ALL
  | typeof SATELLITE_PAGINATION_ACTIVE
  | typeof SATELLITE_PAGINATION_ORACLES
  | typeof SATELLITE_PAGINATION_BY_ADDRESS

export const SATELLITE_DEFFAULT_FILTERS = {
  [SATELLITE_PAGINATION_ALL]: {
    where: {},
    orderBy: {},
  },
  [SATELLITE_PAGINATION_ACTIVE]: {
    where: {},
    orderBy: {},
  },
  [SATELLITE_PAGINATION_ORACLES]: {
    where: {},
    orderBy: {},
  },
  [SATELLITE_PAGINATION_BY_ADDRESS]: {
    where: {},
    orderBy: {},
  },
}

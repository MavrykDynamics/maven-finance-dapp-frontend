import {
  NullableSatelliteGovernanceContextStateType,
  SatelliteGovernanceContextStateType,
  SatelliteGovernanceSubsRecordType,
} from '../satelliteGovernance.provider.types'

export const SUSPEND_SATELLITE_ACTION = 'suspendSatellite'
export const UNSUSPEND_SATELLITE_ACTION = 'unsuspendSatellite'
export const BAN_SATELLITE_ACTION = 'banSatellite'
export const UNBAN_SATELLITE_ACTION = 'unbanSatellite'
export const REMOVE_ORACLES_ACTION = 'removeOracles'
export const REMOVE_ORACLES_AGGREGATOR_ACTION = 'removeOracleInAggregator'
export const ADD_ORACLES_AGGREGATOR_ACTION = 'addOracleToAggregator'
export const SET_AGGREGATOR_MAINTAINER_ACTION = 'setAggregatorMaintainer'
export const DROP_ACTION = 'dropAction'
export const VOTE_FOR_ACTION = 'voteForAction'
export const RESTORE_SATELLITE_ACTION = 'restoreSatellite'
export const UPDATE_AGGREGATOR_STATUS_ACTION = 'updateAggregatorStatus'
export const REGISTER_AGGREGATOR_ACTION = 'registerAggregator'
export const FIX_MISTAKEN_TRANSFER_ACTION = 'fixMistakenTransfer'

// subs
export const SATELLITES_GOVERNANCE_STORAGE_SUB = 'getSatellitesStorageData'

export const DEFAULT_SATELLITE_GOVERNANCE_SUBS: SatelliteGovernanceSubsRecordType = {
  [SATELLITES_GOVERNANCE_STORAGE_SUB]: false,
} as const

// CONTEXT VARS
export const DEFAULT_SATELLITE_GOV_CTX: NullableSatelliteGovernanceContextStateType = {
  config: null,
  ongoingSatelliteGovIds: null,
  pastSatelliteGovIds: null,
  mySatelliteGovIds: null,
  satelliteGovIdsMapper: null,
} as const

export const EMPTY_SATELLITE_GOV_CTX: SatelliteGovernanceContextStateType = {
  config: {
    address: '',
    admin: '',
    approvalPercentage: 0,
    durationInDays: 0,
    counter: 0,
    governanceId: '',
    maxActionsCount: 0,
  },
  ongoingSatelliteGovIds: [],
  pastSatelliteGovIds: [],
  mySatelliteGovIds: [],
  satelliteGovIdsMapper: {},
}

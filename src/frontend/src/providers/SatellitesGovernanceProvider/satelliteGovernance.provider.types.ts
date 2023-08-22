import {
  normalizeSatelliteGovernanceConfig,
  normalizerSatelliteGovernanceActions,
} from './helpers/satelliteGov.normalizer'
import {
  SATELLITES_GOVERNANCE_ALL_ACTIONS_SUB,
  SATELLITES_GOVERNANCE_CONFIG_SUB,
  SATELLITES_GOVERNANCE_CURRENT_USER_ACTIONS_SUB,
  SATELLITES_GOVERNANCE_ONGOING_ACTIONS_SUB,
  SATELLITES_GOVERNANCE_PAST_ACTIONS_SUB,
  SATELLITE_GOV_ACTIONS_DATA,
} from './helpers/satellitesGov.consts'

export type SatelliteGovNormalizerReturnType = {
  config: ReturnType<typeof normalizeSatelliteGovernanceConfig>
} & ReturnType<typeof normalizerSatelliteGovernanceActions>

export type SatelliteGovernanceContextStateType = {
  config: SatelliteGovNormalizerReturnType['config']
  ongoingSatelliteGovIds: SatelliteGovNormalizerReturnType['ongoingSatelliteGovIds']
  pastSatelliteGovIds: SatelliteGovNormalizerReturnType['pastSatelliteGovIds']
  mySatelliteGovIds: SatelliteGovNormalizerReturnType['mySatelliteGovIds']
  satelliteGovIdsMapper: SatelliteGovNormalizerReturnType['satelliteGovIdsMapper']
}

export type NullableSatelliteGovernanceContextStateType = DeepNullable<SatelliteGovernanceContextStateType>

export type SatelliteGovernanceContext = SatelliteGovernanceContextStateType & {
  isLoading: boolean

  changeSatelliteGovSubscriptionsList: (subs: Partial<SatelliteGovernanceSubsRecordType>) => void
}

export type SatelliteGovActionSubsType =
  | typeof SATELLITES_GOVERNANCE_PAST_ACTIONS_SUB
  | typeof SATELLITES_GOVERNANCE_ONGOING_ACTIONS_SUB
  | typeof SATELLITES_GOVERNANCE_ALL_ACTIONS_SUB
  | typeof SATELLITES_GOVERNANCE_CURRENT_USER_ACTIONS_SUB

export type SatelliteGovSubsType = SatelliteGovActionSubsType | typeof SATELLITES_GOVERNANCE_CONFIG_SUB

export type SatelliteGovernanceSubsRecordType = {
  [SATELLITES_GOVERNANCE_CONFIG_SUB]: boolean // subscribe to config
  [SATELLITE_GOV_ACTIONS_DATA]: SatelliteGovActionSubsType | null // choose only one subsription for actions data
}

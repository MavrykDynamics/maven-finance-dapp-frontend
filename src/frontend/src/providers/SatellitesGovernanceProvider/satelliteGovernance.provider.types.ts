import { TokenType } from 'utils/TypesAndInterfaces/General'
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
import {
  OngoingGovernanceSatelliteActionsQueryQuery,
  PastGovernanceSatelliteActionsQueryQuery,
  UserGovernanceSatelliteActionsQueryQuery,
} from 'utils/__generated__/graphql'

export type SatelliteGovNormalizerReturnType = {
  config: ReturnType<typeof normalizeSatelliteGovernanceConfig>
} & ReturnType<typeof normalizerSatelliteGovernanceActions>

// ------ context type
export type SatelliteGovernanceContextStateType = {
  config: SatelliteGovNormalizerReturnType['config']
  ongoingSatelliteGovIds: SatelliteGovNormalizerReturnType['ongoingSatelliteGovIds']
  pastSatelliteGovIds: SatelliteGovNormalizerReturnType['pastSatelliteGovIds']
  mySatelliteGovIds: SatelliteGovNormalizerReturnType['mySatelliteGovIds']
  satelliteGovIdsMapper: SatelliteGovNormalizerReturnType['satelliteGovIdsMapper']
  allSatelliteGovIds: SatelliteGovNormalizerReturnType['allSatelliteGovIds']
}

export type NullableSatelliteGovernanceContextStateType = DeepNullable<SatelliteGovernanceContextStateType>

export type SatelliteGovernanceContext = SatelliteGovernanceContextStateType & {
  isLoading: boolean

  changeSatelliteGovSubscriptionsList: (subs: Partial<SatelliteGovernanceSubsRecordType>) => void
}

export type SatelliteGovernanceActionsIndexerType =
  | OngoingGovernanceSatelliteActionsQueryQuery
  | PastGovernanceSatelliteActionsQueryQuery
  | UserGovernanceSatelliteActionsQueryQuery

// ------ subs type
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

// ------ common types
export type SatelliteGovernanceTransfer = {
  to_: string //this is a contract address
  amount: number
  token: TokenType
}

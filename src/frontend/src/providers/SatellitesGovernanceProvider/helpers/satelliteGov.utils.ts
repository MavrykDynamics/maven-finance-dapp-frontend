import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'
import {
  NullableSatelliteGovernanceContextStateType,
  SatelliteGovernanceContext,
  SatelliteGovernanceContextStateType,
  SatelliteGovernanceSubsRecordType,
} from '../satelliteGovernance.provider.types'
import {
  EMPTY_SATELLITE_GOV_CTX,
  SATELLITES_GOVERNANCE_CONFIG_SUB,
  SATELLITE_GOV_ACTIONS_DATA,
  SATELLITES_GOVERNANCE_PAST_ACTIONS_SUB,
  SATELLITES_GOVERNANCE_ONGOING_ACTIONS_SUB,
  SATELLITES_GOVERNANCE_ALL_ACTIONS_SUB,
  SATELLITES_GOVERNANCE_CURRENT_USER_ACTIONS_SUB,
} from './satellitesGov.consts'

type SatelliteGovernanceContextReturnValueArgs = {
  satelliteGovCtxState: NullableSatelliteGovernanceContextStateType
  changeSatelliteGovSubscriptionsList: SatelliteGovernanceContext['changeSatelliteGovSubscriptionsList']
  activeSubs: SatelliteGovernanceSubsRecordType
}

export const getSatelliteGovernanceProviderReturnValue = ({
  satelliteGovCtxState,
  changeSatelliteGovSubscriptionsList,
  activeSubs,
}: SatelliteGovernanceContextReturnValueArgs) => {
  const { satelliteGovIdsMapper, ongoingSatelliteGovIds, pastSatelliteGovIds, mySatelliteGovIds, config } =
    satelliteGovCtxState

  const commonToReturn = {
    changeSatelliteGovSubscriptionsList,
  }

  const isSatelliteGovMapperEmpty = satelliteGovIdsMapper === null

  const isSatelliteGivActionsDataEmpty =
    pastSatelliteGovIds === null ||
    ongoingSatelliteGovIds === null ||
    mySatelliteGovIds === null ||
    isSatelliteGovMapperEmpty

  const isLoading =
    (activeSubs[SATELLITES_GOVERNANCE_CONFIG_SUB] && config === null) ||
    (activeSubs[SATELLITE_GOV_ACTIONS_DATA] === SATELLITES_GOVERNANCE_PAST_ACTIONS_SUB &&
      pastSatelliteGovIds === null &&
      isSatelliteGovMapperEmpty) ||
    (activeSubs[SATELLITE_GOV_ACTIONS_DATA] === SATELLITES_GOVERNANCE_ONGOING_ACTIONS_SUB &&
      ongoingSatelliteGovIds === null &&
      isSatelliteGovMapperEmpty) ||
    (activeSubs[SATELLITE_GOV_ACTIONS_DATA] === SATELLITES_GOVERNANCE_ALL_ACTIONS_SUB &&
      satelliteGovIdsMapper === null &&
      isSatelliteGovMapperEmpty) ||
    (activeSubs[SATELLITE_GOV_ACTIONS_DATA] === SATELLITES_GOVERNANCE_CURRENT_USER_ACTIONS_SUB &&
      mySatelliteGovIds === null &&
      isSatelliteGovMapperEmpty) ||
    (!activeSubs[SATELLITES_GOVERNANCE_CONFIG_SUB] && config === null) ||
    (activeSubs[SATELLITE_GOV_ACTIONS_DATA] === null && isSatelliteGivActionsDataEmpty)

  // if provider is loading smth return loading true and default empty context (nonNullable)
  if (isLoading) {
    return {
      ...commonToReturn,
      ...EMPTY_SATELLITE_GOV_CTX,
      isLoading: true,
    }
  }

  // if subscribed data loaded return loading false and contextState where all null values replaced with nonNullable value
  const nonNullableProviderValue = replaceNullValuesWithDefault<SatelliteGovernanceContextStateType>(
    satelliteGovCtxState,
    EMPTY_SATELLITE_GOV_CTX,
  )
  return {
    ...commonToReturn,
    ...nonNullableProviderValue,
    isLoading: false,
  }
}

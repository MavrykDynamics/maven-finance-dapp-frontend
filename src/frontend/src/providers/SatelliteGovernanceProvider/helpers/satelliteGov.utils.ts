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
  const {
    satelliteGovIdsMapper,
    ongoingSatelliteGovIds,
    pastSatelliteGovIds,
    mySatelliteGovIds,
    allSatelliteGovIds,
    config,
  } = satelliteGovCtxState

  const commonToReturn = {
    changeSatelliteGovSubscriptionsList,
  }

  const isSatelliteGovActionsDataEmpty =
    pastSatelliteGovIds === null ||
    ongoingSatelliteGovIds === null ||
    mySatelliteGovIds === null ||
    satelliteGovIdsMapper === null

  // actions sub statuses
  const isPastActionsSub = activeSubs[SATELLITE_GOV_ACTIONS_DATA] === SATELLITES_GOVERNANCE_PAST_ACTIONS_SUB
  const isOngoingActionsSub = activeSubs[SATELLITE_GOV_ACTIONS_DATA] === SATELLITES_GOVERNANCE_ONGOING_ACTIONS_SUB
  const isAllActionsSub = activeSubs[SATELLITE_GOV_ACTIONS_DATA] === SATELLITES_GOVERNANCE_ALL_ACTIONS_SUB
  const isCurrentUserActionsSub =
    activeSubs[SATELLITE_GOV_ACTIONS_DATA] === SATELLITES_GOVERNANCE_CURRENT_USER_ACTIONS_SUB

  /**
   * Sety Loading to true when:
   * 1. Config sub is active && config data is null
   * 2. Past actions sub is active && past ids array is null
   * 3. Ongoing actions sub is active && ongoing ids array is null
   * 4. All actions sub is active && all ids array is null
   * 5. Current user actions sub is active && current user ids array is null
   * 6. Config sub is "false" && config data is null
   * 7. No actions active sub && actions mapper is null
   */
  const isLoading =
    (activeSubs[SATELLITES_GOVERNANCE_CONFIG_SUB] && config === null) || // 1
    (isPastActionsSub && pastSatelliteGovIds === null) || // 2
    (isOngoingActionsSub && ongoingSatelliteGovIds === null) || // 3
    (isAllActionsSub && allSatelliteGovIds === null) || // 4
    (isCurrentUserActionsSub && mySatelliteGovIds === null) || // 5
    (!activeSubs[SATELLITES_GOVERNANCE_CONFIG_SUB] && config === null) || // 6
    (activeSubs[SATELLITE_GOV_ACTIONS_DATA] === null && isSatelliteGovActionsDataEmpty) // 7

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

import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'
import {
  NullableSatelliteGovernanceContextStateType,
  SatelliteGovernanceContext,
  SatelliteGovernanceContextStateType,
  SatelliteGovernanceSubsRecordType,
} from '../satelliteGovernance.provider.types'
import { EMPTY_SATELLITE_GOV_CTX, SATELLITES_GOVERNANCE_STORAGE_SUB } from './satellitesGov.consts'

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
  const { satelliteGovIdsMapper, ongoingSatelliteGovIds, pastSatelliteGovIds, mySatelliteGovIds } = satelliteGovCtxState

  const commonToReturn = {
    changeSatelliteGovSubscriptionsList,
  }

  const isSatelliteGovStateEmpty =
    satelliteGovIdsMapper === null ||
    ongoingSatelliteGovIds === null ||
    pastSatelliteGovIds === null ||
    mySatelliteGovIds === null

  const isLoading =
    (activeSubs[SATELLITES_GOVERNANCE_STORAGE_SUB] && isSatelliteGovStateEmpty) ||
    (!activeSubs[SATELLITES_GOVERNANCE_STORAGE_SUB] && isSatelliteGovStateEmpty)

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

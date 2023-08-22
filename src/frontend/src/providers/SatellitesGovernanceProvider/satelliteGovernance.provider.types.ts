import { normalizerSatelliteGovernance } from './helpers/satelliteGov.normalizer'
import { SATELLITES_GOVERNANCE_STORAGE_SUB } from './helpers/satellitesGov.consts'

export type SatelliteGovNormalizerReturnType = ReturnType<typeof normalizerSatelliteGovernance>

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

export type SatelliteGovSubsType = typeof SATELLITES_GOVERNANCE_STORAGE_SUB
export type SatelliteGovernanceSubsRecordType = Record<SatelliteGovSubsType, boolean>

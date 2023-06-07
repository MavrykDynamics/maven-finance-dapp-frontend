import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import type { SatelliteGovernance } from '../utils/TypesAndInterfaces/Governance'
import { GET_SATELLITE_GOVERNANCE_STORAGE } from 'pages/SatelliteGovernance/SatelliteGovernance.actions'
import { defaultGovPurposeMaxLength } from 'app/App.components/Input/Input.constants'

export type SatelliteGovernanceState = {
  config: SatelliteGovernance['config']

  ongoingSatelliteGovIds: number[]
  pastSatelliteGovIds: number[]
  mySatelliteGovIds: number[]
  satelliteGovIdsMapper: SatelliteGovernance['satelliteGovIdsMapper']

  isLoaded: boolean
}

export const defaultSatelliteGovernanceStorage: SatelliteGovernanceState = {
  config: {
    address: '',
    admin: '',
    purposeMaxLength: defaultGovPurposeMaxLength,
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
  isLoaded: false,
}

export function satelliteGovernance(state = defaultSatelliteGovernanceStorage, action: Action) {
  switch (action.type) {
    case GET_SATELLITE_GOVERNANCE_STORAGE:
      return {
        ...state,
        ...action.satelliteGovernanceStorage,
        isLoaded: true,
      }

    default:
      return state
  }
}

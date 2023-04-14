import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import type { GovernanceSatellite } from '../utils/TypesAndInterfaces/Governance'
import { GET_GOVERNANCE_SATELLITE_STORAGE } from 'pages/SatelliteGovernance/SatelliteGovernance.actions'
import { defaultGovPurposeMaxLength } from 'app/App.components/Input/Input.constants'

export type SatelliteGovernanceState = {
  config: GovernanceSatellite['config']
  ongoingGovSatelliteIds: string[]
  pastGovSatelliteIds: string[]
  myGovSatelliteIds: string[]
  govSatelliteIdsMapper: GovernanceSatellite['govSatelliteIdsMapper']
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
  },
  ongoingGovSatelliteIds: [],
  pastGovSatelliteIds: [],
  myGovSatelliteIds: [],
  govSatelliteIdsMapper: {},
  isLoaded: false,
}

export function satelliteGovernance(state = defaultSatelliteGovernanceStorage, action: Action) {
  switch (action.type) {
    case GET_GOVERNANCE_SATELLITE_STORAGE:
      return {
        ...state,
        ...action.governanceSatelliteStorage,
        isLoaded: true,
      }

    default:
      return state
  }
}

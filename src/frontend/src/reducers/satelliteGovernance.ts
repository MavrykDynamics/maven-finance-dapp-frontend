import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import type {
  GovernanceSatelliteActionGraphQL,
  GovernanceSatelliteGraphQL,
} from '../utils/TypesAndInterfaces/Governance'

export type SatelliteGovernanceState = {
  governance_satellite: GovernanceSatelliteGraphQL[]
  governance_satellite_action: GovernanceSatelliteActionGraphQL[]
  isLoaded: boolean
}

export const DEFAULT_SATELLITE_GOVERNANCE_STORAGE: SatelliteGovernanceState = {
  isLoaded: false,
  governance_satellite: [],
  governance_satellite_action: [],
}

export function satelliteGovernance(state = DEFAULT_SATELLITE_GOVERNANCE_STORAGE, action: Action) {
  switch (action.type) {
    // case GET_GOVERNANCE_SATELLITE_STORAGE:
    //   return {
    //     ...state,
    //     governanceSatelliteStorage: action.governanceSatelliteStorage,
    //   }

    default:
      return state
  }
}

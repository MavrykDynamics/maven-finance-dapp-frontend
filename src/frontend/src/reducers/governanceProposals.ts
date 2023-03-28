import { ProposalRecordType } from '../utils/TypesAndInterfaces/Governance'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import type {
  GovernanceSatelliteActionGraphQL,
  GovernanceSatelliteGraphQL,
} from '../utils/TypesAndInterfaces/Governance'
import { GET_PROPOSALS } from 'pages/Governance/actions/GovernanseData.actions'

export type GovernanceProposalsState = {
  currentRoundProposalsIds: Array<number>
  pastProposalsIds: Array<number>
  allProposalsIds: Array<number>
  proposalsMapper: Record<number, ProposalRecordType>
  isLoaded: boolean
}

export const DEFAULT_GOVERNANCE_STORAGE: GovernanceProposalsState = {
  currentRoundProposalsIds: [],
  pastProposalsIds: [],
  allProposalsIds: [],
  proposalsMapper: {},
  isLoaded: false,
}

export type GovernanceSatellite = {
  governance_satellite: GovernanceSatelliteGraphQL[]
  governance_satellite_action: GovernanceSatelliteActionGraphQL[]
}

export function governanceProposals(state = DEFAULT_GOVERNANCE_STORAGE, action: Action) {
  switch (action.type) {
    case GET_PROPOSALS:
      return {
        ...state,
        ...action.proposals,
        isLoaded: true,
      }
    default:
      return state
  }
}

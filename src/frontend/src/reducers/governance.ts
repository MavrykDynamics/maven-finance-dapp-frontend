import { ProposalRecordType } from '../utils/TypesAndInterfaces/Governance'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import type {
  GovernanceSatelliteActionGraphQL,
  GovernanceSatelliteGraphQL,
} from '../utils/TypesAndInterfaces/Governance'
import {
  defaultProposalDescriptionMaxLength,
  defaultProposalInvoiceMaxLength,
  defaultProposalMetadataTitleMaxLength,
  defaultProposalSourceCodeMaxLength,
  defaultProposalTitleMaxLength,
} from 'app/App.components/Input/Input.constants'
import { GET_GOVERNANCE_CONFIG, GET_PROPOSALS } from 'pages/Governance/actions/GovernanseData.actions'

const PROPOSAL = 'PROPOSAL',
  VOTING = 'VOTING',
  TIME_LOCK = 'TIME_LOCK'

export type GovernancePhase = typeof PROPOSAL | typeof VOTING | typeof TIME_LOCK

export type GovernanceState = {
  config: {
    isLoaded: boolean
    address: string
    fee: number
    successReward: number
    proposalDescriptionMaxLength: number
    proposalInvoiceMaxLength: number
    proposalMetadataTitleMaxLength: number
    proposalSourceCodeMaxLength: number
    proposalTitleMaxLength: number

    currentRoundEndLevel: number
    cycle: number
    timelockProposalId: number
    cycleHighestVotedProposalId: number
    cycleCounter: number

    governancePhase: GovernancePhase
  }

  proposals: {
    currentRoundProposalsIds: Array<number>
    pastProposalsIds: Array<number>
    allProposalsIds: Array<number>
    proposalsMapper: Record<number, ProposalRecordType>
    isLoaded: boolean
  }
}

export const DEFAULT_GOVERNANCE_STORAGE: GovernanceState = {
  config: {
    isLoaded: false,
    address: '',
    fee: 0,
    successReward: 0,
    proposalDescriptionMaxLength: defaultProposalDescriptionMaxLength,
    proposalInvoiceMaxLength: defaultProposalInvoiceMaxLength,
    proposalMetadataTitleMaxLength: defaultProposalMetadataTitleMaxLength,
    proposalSourceCodeMaxLength: defaultProposalSourceCodeMaxLength,
    proposalTitleMaxLength: defaultProposalTitleMaxLength,

    currentRoundEndLevel: 0,
    cycle: 0,
    timelockProposalId: 0,
    cycleHighestVotedProposalId: 0,
    cycleCounter: 0,

    governancePhase: 'PROPOSAL',
  },

  proposals: {
    currentRoundProposalsIds: [],
    pastProposalsIds: [],
    allProposalsIds: [],
    proposalsMapper: {},
    isLoaded: false,
  },
}

export type GovernanceSatellite = {
  governance_satellite: GovernanceSatelliteGraphQL[]
  governance_satellite_action: GovernanceSatelliteActionGraphQL[]
}
// export interface GovernanceState {
//   currentRoundProposals: CurrentRoundProposalsStorageType
//   governanceStorage: GovernanceStorage
//   governancePhase: GovernancePhase
//   proposalId?: number
//   pastProposals: CurrentRoundProposalsStorageType
//   vote?: number
//   governanceSatelliteStorage: GovernanceSatellite
//   isGovernanceStorageLoaded: boolean
// }

// const defaultGovernanceStorage = normalizeGovernanceStorage(null)
// const governanceDefaultState: GovernanceState = {
//   governanceStorage: defaultGovernanceStorage,
//   governancePhase: 'PROPOSAL',
//   currentRoundProposals: [],
//   pastProposals: [],
//   governanceSatelliteStorage: {
//     governance_satellite: [],
//     governance_satellite_action: [],
//   },
//   isGovernanceStorageLoaded: false,
// }

export function governance(state = DEFAULT_GOVERNANCE_STORAGE, action: Action) {
  switch (action.type) {
    // case GET_GOVERNANCE_SATELLITE_STORAGE:
    //   return {
    //     ...state,
    //     governanceSatelliteStorage: action.governanceSatelliteStorage,
    //   }
    case GET_PROPOSALS:
      return {
        ...state,
        proposals: { ...action.proposals, isLoaded: true },
      }
    case GET_GOVERNANCE_CONFIG:
      return {
        ...state,
        config: { ...action.config, isLoaded: true },
      }
    default:
      return state
  }
}

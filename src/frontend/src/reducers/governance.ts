import { GovernancePhaseType, GovPhases, ProposalRecordType } from '../utils/TypesAndInterfaces/Governance'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import type {
  GovernanceSatelliteActionGraphQL,
  GovernanceSatelliteGraphQL,
} from '../utils/TypesAndInterfaces/Governance'

import { GET_GOVERNANCE_CONFIG, GET_PROPOSALS } from 'pages/Governance/actions/GovernanseData.actions'
import {
  defaultProposalDescriptionMaxLength,
  defaultProposalInvoiceMaxLength,
  defaultProposalMetadataTitleMaxLength,
  defaultProposalSourceCodeMaxLength,
  defaultProposalTitleMaxLength,
} from 'app/App.components/Input/Input.constants'

export type GovernanceState = {
  config: {
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

    governancePhase: GovernancePhaseType
  }

  currentRoundProposalsIds: Array<number>
  pastProposalsIds: Array<number>
  allProposalsIds: Array<number>
  waitingProposalsIdsToBeExecuted: Array<number>
  waitingProposalsIdsToBePaid: Array<number>
  proposalsMapper: Record<number, ProposalRecordType>
  isLoaded: boolean
}

export const DEFAULT_GOVERNANCE_STORAGE: GovernanceState = {
  config: {
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

    governancePhase: GovPhases.PROPOSAL,
  },

  currentRoundProposalsIds: [],
  pastProposalsIds: [],
  waitingProposalsIdsToBePaid: [],
  waitingProposalsIdsToBeExecuted: [],
  allProposalsIds: [],
  proposalsMapper: {},
  isLoaded: false,
}

export type GovernanceSatellite = {
  governance_satellite: GovernanceSatelliteGraphQL[]
  governance_satellite_action: GovernanceSatelliteActionGraphQL[]
}

export function governance(state = DEFAULT_GOVERNANCE_STORAGE, action: Action) {
  switch (action.type) {
    case GET_GOVERNANCE_CONFIG:
      return {
        ...state,
        config: { ...action.config },
      }
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

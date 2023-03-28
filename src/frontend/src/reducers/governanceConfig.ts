import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

import {
  defaultProposalDescriptionMaxLength,
  defaultProposalInvoiceMaxLength,
  defaultProposalMetadataTitleMaxLength,
  defaultProposalSourceCodeMaxLength,
  defaultProposalTitleMaxLength,
} from 'app/App.components/Input/Input.constants'
import { GET_GOVERNANCE_CONFIG } from 'pages/Governance/actions/GovernanseData.actions'

const PROPOSAL = 'PROPOSAL',
  VOTING = 'VOTING',
  TIME_LOCK = 'TIME_LOCK'

export type GovernancePhase = typeof PROPOSAL | typeof VOTING | typeof TIME_LOCK

export type GovernanceConfigState = {
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

export const DEFAULT_GOVERNANCE_CONFIG_STORAGE: GovernanceConfigState = {
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
}

export function governanceConfig(state = DEFAULT_GOVERNANCE_CONFIG_STORAGE, action: Action) {
  switch (action.type) {
    case GET_GOVERNANCE_CONFIG:
      return {
        ...state,
        ...action.config,
        isLoaded: true,
      }
    default:
      return state
  }
}

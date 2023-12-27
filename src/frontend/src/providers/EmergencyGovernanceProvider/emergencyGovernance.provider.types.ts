import {
  EGOV_CONFIG_SUB,
  EGOV_PROPOSALS_ALL_SUB,
  EGOV_PROPOSALS_SUB,
  SUBMIT_EGOV_PROPOSAL_ACTION,
  VOTE_FOR_EGOV_PROPOSAL_ACTION,
} from './helpers/eGov.consts'
import {normalizeEGovProposal} from './helpers/eGov.normalizer'

// eGov data types
export type EGovProposalType = ReturnType<typeof normalizeEGovProposal>

// actions types
export type EGovProposalActionsType = typeof VOTE_FOR_EGOV_PROPOSAL_ACTION | typeof SUBMIT_EGOV_PROPOSAL_ACTION

// subs types
export type EGovSubsRecordType = {
  [EGOV_CONFIG_SUB]: boolean
  [EGOV_PROPOSALS_SUB]: null | typeof EGOV_PROPOSALS_ALL_SUB
}

// context types
export type EGovContextState = {
  config: {
    emergencyGovActive: boolean
    requiredFeeMutez: number
    sMvnPercentageRequired: number
    minStakedMvnRequiredToVote: number
  }
  allProposals: Array<number>
  pastProposals: Array<number>
  ongoingProposals: Array<number>
  proposalsMapper: Record<number, EGovProposalType>
}
export type NullableEGovContextState = DeepNullable<EGovContextState>
export type EGovContext = EGovContextState & {
  isLoading: boolean

  changeEGovSubscriptionsList: (newSkips: Partial<EGovSubsRecordType>) => void
}

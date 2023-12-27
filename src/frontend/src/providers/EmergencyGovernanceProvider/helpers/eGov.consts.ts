import {EGovSubsRecordType} from '../emergencyGovernance.provider.types'

// actions
export const VOTE_FOR_EGOV_PROPOSAL_ACTION = 'VOTE_FOR_EGOV_PROPOSAL_ACTION'
export const SUBMIT_EGOV_PROPOSAL_ACTION = 'SUBMIT_EGOV_PROPOSAL_ACTION'

// context data
export const DEFAULT_EGOV_CTX = {
  config: null,
  allProposals: null,
  pastProposals: null,
  ongoingProposals: null,
  proposalsMapper: null,
}

export const EMPTY_EGOV_CTX = {
  config: {
    emergencyGovActive: false,
    requiredFeeMutez: 0,
    sMvnPercentageRequired: 0,
    minStakedMvnRequiredToVote: 0,
  },
  allProposals: [],
  pastProposals: [],
  ongoingProposals: [],
  proposalsMapper: {},
}

// subs
export const EGOV_CONFIG_SUB = 'EGOV_CONFIG_SUB'

export const EGOV_PROPOSALS_SUB = 'EGOV_PROPOSALS_SUB'
export const EGOV_PROPOSALS_ALL_SUB = 'EGOV_PROPOSALS_ALL_SUB'

export const DEFAULT_EGOV_SUBS: EGovSubsRecordType = {
  [EGOV_CONFIG_SUB]: false,
  [EGOV_PROPOSALS_SUB]: null,
} as const

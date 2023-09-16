import {
  DROP_PROPOSAL_ACTION,
  EXECUTE_PROPOSAL_ACTION,
  GovPhases,
  LOCK_PROPOSAL_ACTION,
  PROCESS_PROPOSAL_ACTION,
  PROPOSAL_ROUND_VOTE_ACTION,
  ProposalStatus,
  START_NEXT_ROUND_ACTION,
  START_PROPOSAL_ROUND_ACTION,
  START_VOTING_ROUND_ACTION,
  SUBMIT_PROPOSAL_ACTION,
  UPDATE_PROPOSAL_DATA_ACTION,
  VOTING_ROUND_VOTE_ACTION,
} from './proposals.const'

import { normalizeProposal } from './proposals.normalizer'

export type ProposalActionsTypes =
  | typeof PROPOSAL_ROUND_VOTE_ACTION
  | typeof VOTING_ROUND_VOTE_ACTION
  | typeof EXECUTE_PROPOSAL_ACTION
  | typeof PROCESS_PROPOSAL_ACTION
  | typeof SUBMIT_PROPOSAL_ACTION
  | typeof DROP_PROPOSAL_ACTION
  | typeof LOCK_PROPOSAL_ACTION
  | typeof UPDATE_PROPOSAL_DATA_ACTION
  | typeof START_PROPOSAL_ROUND_ACTION
  | typeof START_VOTING_ROUND_ACTION
  | typeof START_NEXT_ROUND_ACTION

// Proposal types
export type ProposalRecordType = ReturnType<typeof normalizeProposal>

export type ProposalStatusType = (typeof ProposalStatus)[keyof typeof ProposalStatus]

// Governance Proposals config types
export type GovernancePhaseType = (typeof GovPhases)[keyof typeof GovPhases]

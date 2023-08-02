import { ProposalsSubsRecordType, ProposalsContextStateType } from '../proposals.provider.types'

// proposal actions
export const PROPOSAL_ROUND_VOTE_ACTION = 'proposalRoundVote'
export const VOTING_ROUND_VOTE_ACTION = 'votingRoundVote'
export const EXECUTE_PROPOSAL_ACTION = 'executeProposal'
export const PROCESS_PROPOSAL_ACTION = 'processProposalPayment'

// proposal submission actions
export const SUBMIT_PROPOSAL_ACTION = 'submitProposal'
export const DROP_PROPOSAL_ACTION = 'dropProposal'
export const LOCK_PROPOSAL_ACTION = 'lockProposal'
export const UPDATE_PROPOSAL_DATA_ACTION = 'updateProposalData'

// proposal governance interactions actions
export const START_PROPOSAL_ROUND_ACTION = 'startProposalRound'
export const START_VOTING_ROUND_ACTION = 'startVotingRound'
export const START_NEXT_ROUND_ACTION = 'startNextRound'

// Proposals
export const ProposalStatus = {
  EXECUTED: 'EXECUTED',
  DEFEATED: 'DEFEATED',
  ONGOING: 'ONGOING',
  WAITING: 'WAITING',
  DROPPED: 'DROPPED',
  LOCKED: 'LOCKED',
  UNLOCKED: 'UNLOCKED',
  TIMELOCK: 'TIMELOCK',
} as const

// Governance config
export const GovPhases = {
  PROPOSAL: 'PROPOSAL',
  VOTING: 'VOTING',
  TIMELOCK: 'TIMELOCK',
} as const

// Context consts
export const DEFAULT_PROPOSALS_CTX: ProposalsContextStateType = {
  config: null,
  proposalsMapper: null,
  currentRoundProposalsIds: null,
  pastProposalsIds: null,
  submissionProposalsIds: null,
  allProposalsIds: null,
  waitingProposalsIdsToBeExecuted: null,
  waitingProposalsIdsToBePaid: null,
}

export const EMPTY_PROPOSALS_CTX: DeepNonNullable<ProposalsContextStateType> = {
  config: {
    fee: 0,
    successReward: 0,
    currentRoundEndLevel: 0,
    cycle: 0,
    timelockProposalId: -1,
    cycleHighestVotedProposalId: -1,
    governancePhase: GovPhases.PROPOSAL,
  },

  proposalsMapper: {},
  currentRoundProposalsIds: [],
  pastProposalsIds: [],
  submissionProposalsIds: [],
  allProposalsIds: [],
  waitingProposalsIdsToBeExecuted: [],
  waitingProposalsIdsToBePaid: [],
}

// SUBS
export const GOVERNANCE_CONFIG_SUB = 'GOVERNANCE_CONFIG_SUB'
export const PROPOSALS_DATA_SUB = 'PROPOSALS_DATA_SUB'
export const PROPOSALS_CURRENT_DATA = 'PROPOSALS_CURRENT_DATA_SUB'
export const PROPOSALS_ALL_DATA = 'PROPOSALS_ALL_DATA_SUB'
export const PROPOSALS_PAST_DATA = 'PROPOSALS_PAST_DATA_SUB'
export const PROPOSALS_SUBMISSION_DATA = 'PROPOSALS_SUBMISSION_DATA_SUB'

export const DEFAULT_PROPOSALS_ACTIVE_SUBS: ProposalsSubsRecordType = {
  [PROPOSALS_DATA_SUB]: null,
  [GOVERNANCE_CONFIG_SUB]: false,
}

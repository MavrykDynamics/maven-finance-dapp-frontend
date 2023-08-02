import {
  GOVERNANCE_CONFIG_SUB,
  PROPOSALS_CURRENT_DATA,
  PROPOSALS_SUBMISSION_DATA,
  PROPOSALS_DATA_SUB,
  PROPOSALS_PAST_DATA,
  PROPOSALS_ALL_DATA,
} from './helpers/proposals.const'

import { GovernancePhaseType, ProposalRecordType } from './helpers/proposals.types'

export type ProposalsContextStateType = {
  config: {
    fee: number
    successReward: number
    currentRoundEndLevel: number
    cycle: number
    timelockProposalId: number
    cycleHighestVotedProposalId: number
    governancePhase: GovernancePhaseType
  } | null

  proposalsMapper: Record<number, ProposalRecordType> | null
  currentRoundProposalsIds: Array<number> | null
  pastProposalsIds: Array<number> | null
  submissionProposalsIds: Array<number> | null
  allProposalsIds: Array<number> | null
  waitingProposalsIdsToBeExecuted: Array<number> | null
  waitingProposalsIdsToBePaid: Array<number> | null
}

export type ProposalsContext = DeepNonNullable<ProposalsContextStateType> & {
  isLoading: boolean

  changeProposalsSubscriptionsList: (newSkips: Partial<ProposalsSubsRecordType>) => void
}

export type ProposalsSubsRecordType = {
  [GOVERNANCE_CONFIG_SUB]: boolean
  [PROPOSALS_DATA_SUB]:
    | typeof PROPOSALS_CURRENT_DATA
    | typeof PROPOSALS_PAST_DATA
    | typeof PROPOSALS_ALL_DATA
    | typeof PROPOSALS_SUBMISSION_DATA
    | null
}

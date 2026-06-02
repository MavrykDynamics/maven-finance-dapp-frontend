import { buildProviderReturnValue } from 'providers/common/utils/buildProviderReturnValue'
import {
  EMPTY_PROPOSALS_CTX,
  GOVERNANCE_CONFIG_SUB,
  GovPhases,
  PROPOSALS_CURRENT_DATA,
  PROPOSALS_DATA_SUB,
  PROPOSALS_PAST_DATA,
  PROPOSALS_SUBMISSION_DATA,
  ProposalStatus,
} from './proposals.const'

import {
  NullableProposalsContextState,
  ProposalsContext,
  ProposalsSubsRecordType,
} from '../proposals.provider.types'
import { ProposalsDataQueryQuery } from 'utils/__generated__/graphql'
import { GovernancePhaseType, ProposalStatusType } from './proposals.types'

export const getProposalStatus = (
  proposal: ProposalsDataQueryQuery['governance_proposal'][number],
  governancePhase: GovernancePhaseType,
  cycleHighestVotedProposalId: number | null,
  timelockProposalId: number | null,
): ProposalStatusType => {
  // if proposal is executed give it's executed status
  if (proposal.executed) return ProposalStatus.EXECUTED

  // if proposal status is 1 (dropped) return dropped status
  if (proposal.status === 1) return ProposalStatus.DROPPED

  // if proposal is not in current round and it's matching with the timelockProposalId and it's not executed, or it has unpaind payments it's waiting proposal
  if (
    !proposal.current_round_proposal &&
    (proposal.id === timelockProposalId || (!proposal.payment_processed && proposal.payments.length))
  )
    return ProposalStatus.WAITING

  // if proposal is not in current round and not executed it's defeated proposal
  if (!proposal.current_round_proposal) return ProposalStatus.DEFEATED

  // at this point we have not dropped, NOT executed NOT current round proposals

  // if we are in voting round and proposal has most votes (only 1 proposal in voting round)
  const isVotingRound = governancePhase === GovPhases.VOTING
  if (isVotingRound && proposal.id === cycleHighestVotedProposalId) return ProposalStatus.ONGOING

  // 5. if we are in timelock round and this proposal is set that this is in timelock round in indexer
  const isTimeLockRound = governancePhase === GovPhases.TIMELOCK
  if (isTimeLockRound && proposal.id === timelockProposalId) return ProposalStatus.TIMELOCK

  // 6.if we are in proposal round and proposal is locked/unocked show this in status
  const isProposalRound = governancePhase === GovPhases.PROPOSAL || governancePhase === GovPhases.EXECUTION
  if (isProposalRound && proposal.locked) return ProposalStatus.LOCKED
  if (isProposalRound && !proposal.locked) return ProposalStatus.UNLOCKED

  // default case, cuz all condiitons above are not true
  return ProposalStatus.DEFEATED
}

export const getProposalsProviderReturnValue = ({
  proposalsCtxState,
  changeProposalsSubscriptionsList,
  activeSubs,
}: {
  proposalsCtxState: NullableProposalsContextState
  changeProposalsSubscriptionsList: ProposalsContext['changeProposalsSubscriptionsList']
  activeSubs: ProposalsSubsRecordType
}) => {
  const commonToReturn = {
    changeProposalsSubscriptionsList,
  }

  const {
    config,
    proposalsMapper,
    pastProposalsIds,
    currentRoundProposalsIds,
    waitingProposalsIdsToBeExecuted,
    waitingProposalsIdsToBePaid,
    submissionProposalsIds,
  } = proposalsCtxState

  const isSubmissionProposalsLoading =
    activeSubs[PROPOSALS_DATA_SUB] === PROPOSALS_SUBMISSION_DATA && !submissionProposalsIds && !proposalsMapper
  const isGovernanceConfigLoading = activeSubs[GOVERNANCE_CONFIG_SUB] && !config
  const isGovernancePastProposalsLoading = activeSubs[PROPOSALS_DATA_SUB] === PROPOSALS_PAST_DATA && !pastProposalsIds
  const isGovernanceCurrentProposalsLoading =
    activeSubs[PROPOSALS_DATA_SUB] === PROPOSALS_CURRENT_DATA &&
    !currentRoundProposalsIds &&
    !waitingProposalsIdsToBeExecuted &&
    !waitingProposalsIdsToBePaid

  const isLoading =
    isSubmissionProposalsLoading ||
    isGovernanceConfigLoading ||
    isGovernanceCurrentProposalsLoading ||
    isGovernancePastProposalsLoading ||
    (activeSubs[PROPOSALS_DATA_SUB] !== null && proposalsMapper === null)

  return buildProviderReturnValue(proposalsCtxState, EMPTY_PROPOSALS_CTX, commonToReturn, Boolean(isLoading))
}

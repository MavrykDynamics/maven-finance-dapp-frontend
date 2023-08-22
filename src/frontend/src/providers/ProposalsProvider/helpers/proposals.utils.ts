import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'
import { EMPTY_PROPOSALS_CTX, GovPhases, ProposalStatus } from './proposals.const'

import {
  NullableProposalsContextState,
  ProposalsContext,
  ProposalsContextStateType,
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
  const isProposalRound = governancePhase === GovPhases.PROPOSAL
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

  const isLoading = true

  // if provider is loading smth return loading true and default empty context (nonNullable)
  if (isLoading) {
    return {
      ...commonToReturn,
      ...EMPTY_PROPOSALS_CTX,
      isLoading: true,
    }
  }

  // if subscribed data loaded return loading false and contextState where all null values replaced with nonNullable value
  const nonNullableProviderValue = replaceNullValuesWithDefault<ProposalsContextStateType>(
    proposalsCtxState,
    EMPTY_PROPOSALS_CTX,
  )

  return {
    ...commonToReturn,
    ...nonNullableProviderValue,
    isLoading: false,
  }
}

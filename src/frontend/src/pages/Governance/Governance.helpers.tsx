import {
  ProposalStatusType,
  ProposalStatus,
  GovernancePhaseType,
  GovPhases,
  GovernanceProposalGraphQL,
} from '../../utils/TypesAndInterfaces/Governance'

export const getProposalStatus = (
  proposal: GovernanceProposalGraphQL,
  governancePhase: GovernancePhaseType,
  cycleHighestVotedProposalId: number,
  timelockProposalId: number,
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

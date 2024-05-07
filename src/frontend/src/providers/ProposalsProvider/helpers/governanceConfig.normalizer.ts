import { GovPhases } from 'providers/ProposalsProvider/helpers/proposals.const'
import { GovernanceConfigQueryQuery } from 'utils/__generated__/graphql'
import { ProposalIndexerType, ProposalsContext } from '../proposals.provider.types'
import { convertNumberForClient } from 'utils/calcFunctions'
import { MVN_DECIMALS, XTZ_DECIMALS } from 'utils/constants'

const calcGovPhase = (round: number, hasProposalToExecute?: boolean) => {
  if (round === 0) {
    if (hasProposalToExecute) return GovPhases.EXECUTION
    return GovPhases.PROPOSAL
  }

  if (round === 1) return GovPhases.VOTING

  return GovPhases.TIMELOCK
}

export const normalizeGovernanceConfig = (dataFromIndexer: GovernanceConfigQueryQuery): ProposalsContext['config'] => {
  const {
    proposal_submission_fee_mumav,
    success_reward,
    current_round_end_level,
    cycle_id,
    timelock_proposal_id,
    cycle_highest_voted_proposal_id,
    current_round,
    proposals,
  } = dataFromIndexer.governance[0]

  const hasProposalToExecute = Boolean(proposals.find(({ id }) => id === timelock_proposal_id))

  return {
    fee: convertNumberForClient({ number: proposal_submission_fee_mumav, grade: XTZ_DECIMALS }),
    successReward: convertNumberForClient({ number: success_reward, grade: MVN_DECIMALS }),
    currentRoundEndLevel: current_round_end_level,
    cycle: cycle_id,
    timelockProposalId: timelock_proposal_id ?? null,
    cycleHighestVotedProposalId: cycle_highest_voted_proposal_id ?? null,

    governancePhase: calcGovPhase(current_round, hasProposalToExecute),
  }
}

export type GovernanceConfigForProposalsNormalizationType = Pick<
  ProposalsContext['config'],
  'governancePhase' | 'timelockProposalId' | 'cycleHighestVotedProposalId'
>
export const normalizeSmallGovernanceConfig = (
  dataFromIndexer: ProposalIndexerType['governance'][number],
): GovernanceConfigForProposalsNormalizationType => {
  const { timelock_proposal_id, cycle_highest_voted_proposal_id, current_round } = dataFromIndexer

  return {
    timelockProposalId: timelock_proposal_id ?? null,
    cycleHighestVotedProposalId: cycle_highest_voted_proposal_id ?? null,
    governancePhase: calcGovPhase(current_round),
  }
}

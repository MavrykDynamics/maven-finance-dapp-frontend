import { GovPhases } from 'providers/ProposalsProvider/helpers/proposals.const'
import { GovernanceConfigSubscriptionSubscription } from 'utils/__generated__/graphql'
import { ProposalsContext } from '../proposals.provider.types'
import { convertNumberForClient } from 'utils/calcFunctions'
import { XTZ_DECIMALS, MVK_DECIMALS } from 'utils/constants'

const calcGovPhase = (round: number) =>
  round === 0 ? GovPhases.PROPOSAL : round === 1 ? GovPhases.VOTING : GovPhases.TIMELOCK

export const normalizeGovernanceConfig = (
  dataFromIndexer: GovernanceConfigSubscriptionSubscription,
): ProposalsContext['config'] => {
  const {
    proposal_submission_fee_mutez,
    success_reward,
    current_round_end_level,
    cycle_id,
    timelock_proposal_id,
    cycle_highest_voted_proposal_id,
    current_round,
  } = dataFromIndexer.governance[0]

  return {
    fee: convertNumberForClient({ number: proposal_submission_fee_mutez, grade: XTZ_DECIMALS }),
    successReward: convertNumberForClient({ number: success_reward, grade: MVK_DECIMALS }),
    currentRoundEndLevel: current_round_end_level,
    cycle: cycle_id,
    timelockProposalId: timelock_proposal_id ?? null,
    cycleHighestVotedProposalId: cycle_highest_voted_proposal_id ?? null,

    governancePhase: calcGovPhase(current_round),
  }
}

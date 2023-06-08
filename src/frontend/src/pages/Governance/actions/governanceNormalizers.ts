import { State } from 'reducers'
import { calcWithoutPrecision, calcWithoutMu, convertNumberForClient } from 'utils/calcFunctions'
import {
  GovernanceProposalGraphQL,
  GovernanceGraphQL,
  GovPhases,
  ProposalStatus,
} from 'utils/TypesAndInterfaces/Governance'
import { getProposalStatus } from '../Governance.helpers'
import { MVK_DECIMALS } from 'utils/constants'

export const normalizeProposal = (
  item: GovernanceProposalGraphQL,
  dipDupTokens: State['tokens']['dipDupTokens'],
  { governancePhase, cycleHighestVotedProposalId, timelockProposalId }: State['governance']['config'],
) => {
  const proposalConvertedStatus = getProposalStatus(
    item,
    governancePhase,
    cycleHighestVotedProposalId,
    timelockProposalId,
  )

  const anyCanExecute = !item.current_round_proposal && timelockProposalId === item.id && !item.executed
  const anyCanPay =
    !item.current_round_proposal &&
    timelockProposalId === item.id &&
    item.executed &&
    item.payments.length &&
    !item.payment_processed

  return {
    id: item.id,
    proposerId: item.proposer.address,
    governanceId: item.governance.address,

    status: proposalConvertedStatus,
    anyCanExecute,
    anyCanPay,

    title: item.title,
    description: item.description,
    invoice: item.invoice,

    paymentProcessed: item.payment_processed,
    executed: item.executed,
    locked: item.locked,
    currentRoundProposal: item.current_round_proposal,

    currentCycleEndLevel: item.current_cycle_end_level,
    cycle: item.cycle,
    successReward: item.success_reward,
    sourceCode: item.source_code,

    // voting data
    passVoteMvkTotal: convertNumberForClient({ number: item.proposal_vote_smvk_total, grade: MVK_DECIMALS }),
    upvoteMvkTotal: convertNumberForClient({ number: item.yay_vote_smvk_total, grade: MVK_DECIMALS }),
    downvoteMvkTotal: convertNumberForClient({ number: item.nay_vote_smvk_total, grade: MVK_DECIMALS }),
    abstainMvkTotal: convertNumberForClient({ number: item.pass_vote_smvk_total, grade: MVK_DECIMALS }),
    quorumMvkTotal: convertNumberForClient({ number: item.quorum_smvk_total, grade: MVK_DECIMALS }),
    votes: item.votes,
    minQuorumPercentage: convertNumberForClient({ number: item.min_quorum_percentage, grade: 4 }),

    proposalData: item.data.map((byte, idx) => ({
      ...byte,
      order: idx,
      isUnderTheDrop: false,
      isLocalBytes: false,
    })),

    // TODO: update token usage
    proposalPayments: item.payments
      .map(({ to_, title, id, token_id, token_amount, token }) => {
        const tokenAddress = token?.token_address
        // TODO: remove this check with tokens reorganization
        const decimals =
          tokenAddress?.toLowerCase() === 'xtz'
            ? 6
            : dipDupTokens?.find(({ token_address }) => token_address === tokenAddress)?.metadata?.decimals ?? 0

        return {
          id,
          to__id: to_?.address,
          title,
          token_address: tokenAddress,
          token_id,
          // we're getting amount * by 10 in decimals grage, need to parse it to initial user input
          token_amount: Number(token_amount) / Math.pow(10, Number(decimals)) ?? 0,
        }
      })
      .filter(({ token_address, to__id }) => token_address && to__id),
  }
}

export const normalizeGovernanceProposals = (
  proposals: Array<GovernanceProposalGraphQL>,
  dipDupTokens: State['tokens']['dipDupTokens'],
  governanceConfig: State['governance']['config'],
): Omit<Omit<State['governance'], 'isLoaded'>, 'config'> => {
  const { governancePhase, timelockProposalId } = governanceConfig
  const isProposalRound = governancePhase === GovPhases.PROPOSAL

  return proposals.reduce<Omit<Omit<State['governance'], 'isLoaded'>, 'config'>>(
    (acc, proposalFromGQL) => {
      const normalizedProposal = normalizeProposal(proposalFromGQL, dipDupTokens, governanceConfig)

      const { id, executed, status, currentRoundProposal, paymentProcessed } = normalizedProposal

      acc.proposalsMapper[id] = normalizedProposal
      acc.allProposalsIds.push(id)

      const isPastProposal =
        status === ProposalStatus.DROPPED || status === ProposalStatus.EXECUTED || status === ProposalStatus.DEFEATED

      // Add id of proposal to be executed proposal
      if (isProposalRound && !executed && timelockProposalId === id && !isPastProposal) {
        acc.waitingProposalsIdsToBeExecuted.push(id)
        return acc
      }

      // Add id of proposal to be paid proposal
      if (isProposalRound && !executed && timelockProposalId === id && !paymentProcessed && !isPastProposal) {
        acc.waitingProposalsIdsToBePaid.push(id)
        return acc
      }

      // Add id of past proposal
      if (isPastProposal) {
        acc.pastProposalsIds.push(id)
        return acc
      }

      // Add id of current round proposal
      if (currentRoundProposal) {
        acc.currentRoundProposalsIds.push(id)
        return acc
      }

      return acc
    },
    {
      currentRoundProposalsIds: [],
      pastProposalsIds: [],
      waitingProposalsIdsToBeExecuted: [],
      waitingProposalsIdsToBePaid: [],
      allProposalsIds: [],
      proposalsMapper: {},
    },
  )
}

const calcGovPhase = (round: number) =>
  round === 0 ? GovPhases.PROPOSAL : round === 1 ? GovPhases.VOTING : GovPhases.TIMELOCK

export const normalizeGovernanceConfig = (currentGovernance: GovernanceGraphQL): State['governance']['config'] => {
  return {
    address: currentGovernance.address,
    fee: calcWithoutMu(currentGovernance.proposal_submission_fee_mutez),
    successReward: calcWithoutPrecision(currentGovernance.success_reward),
    currentRoundEndLevel: currentGovernance.current_round_end_level ?? 0,
    cycle: currentGovernance.cycle_id ?? 0,
    timelockProposalId: currentGovernance.timelock_proposal_id ?? 0,
    cycleHighestVotedProposalId: currentGovernance.cycle_highest_voted_proposal_id ?? 0,

    governancePhase: calcGovPhase(currentGovernance.current_round),
  }
}

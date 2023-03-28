import {
  defaultProposalDescriptionMaxLength,
  defaultProposalInvoiceMaxLength,
  defaultProposalMetadataTitleMaxLength,
  defaultProposalSourceCodeMaxLength,
  defaultProposalTitleMaxLength,
} from 'app/App.components/Input/Input.constants'
import { GovernanceConfigState } from 'reducers/governanceConfig'
import { GovernanceProposalsState } from 'reducers/governanceProposals'
import { calcWithoutPrecision, calcWithoutMu } from 'utils/calcFunctions'
import { DipDupTokensGraphQl } from 'utils/TypesAndInterfaces/DipDupTokens'
import { GovernanceProposalGraphQL, GovernanceGraphQL, GovPhases } from 'utils/TypesAndInterfaces/Governance'

export const normalizeProposal = (item: GovernanceProposalGraphQL, dipDupTokens?: Array<DipDupTokensGraphQl>) => {
  return {
    id: item.id,
    proposerId: item.proposer_id,
    status: item.status,
    title: item.title,
    description: item.description,
    invoice: item.invoice,
    successReward: item.success_reward,
    startDateTime: item.start_datetime,
    executed: item.executed,
    locked: item.locked,
    sourceCode: item.source_code,
    passVoteMvkTotal: calcWithoutPrecision(item.proposal_vote_smvk_total),
    upvoteMvkTotal: calcWithoutPrecision(item.yay_vote_smvk_total),
    downvoteMvkTotal: calcWithoutPrecision(item.nay_vote_count),
    abstainMvkTotal: calcWithoutPrecision(item.pass_vote_smvk_total),
    minProposalRoundVoteRequirement: item.min_proposal_round_vote_req,
    minProposalRoundVotePercentage: item.min_proposal_round_vote_pct,
    minQuorumPercentage: item.min_quorum_percentage,
    minQuorumMvkTotal: item.min_yay_vote_percentage,
    quorumMvkTotal: item.quorum_smvk_total,
    currentRoundProposal: item.current_round_proposal,
    currentCycleStartLevel: item.current_cycle_start_level,
    currentCycleEndLevel: item.current_cycle_end_level,
    cycle: item.cycle,
    votes: item.votes,
    proposalData: item.data.map((byte, idx) => ({
      ...byte,
      order: idx,
      isUnderTheDrop: false,
      isLocalBytes: false,
    })),
    proposalPayments: item.payments.map((paymentData) => {
      const decimals =
        dipDupTokens?.find(({ contract }) => contract === paymentData.token_address)?.metadata?.decimals ?? 0

      return {
        ...paymentData,
        // we're getting amount * by 10 in decimals grage, need to parse it to initial user input
        token_amount: Number(paymentData.token_amount) / Math.pow(10, Number(decimals)) ?? 0,
      }
    }),
    governanceId: item.governance_id,
    paymentProcessed: item.payment_processed,
  }
}

export const normalizeGovernanceProposals = (
  proposals: Array<GovernanceProposalGraphQL>,
  dipDupTokens?: Array<DipDupTokensGraphQl>,
): Omit<GovernanceProposalsState, 'isLoaded'> => {
  return proposals.reduce<Omit<GovernanceProposalsState, 'isLoaded'>>(
    (acc, proposalFromGQL) => {
      const normalizedProposal = normalizeProposal(proposalFromGQL, dipDupTokens)

      acc.proposalsMapper[normalizedProposal.id] = normalizedProposal
      acc.allProposalsIds.push(normalizedProposal.id)

      // Add id of current round proposal
      if (normalizedProposal.currentRoundProposal && normalizedProposal.status === 0 && !normalizedProposal.executed) {
        acc.currentRoundProposalsIds.push(normalizedProposal.id)
      }

      // Add id of past proposal
      if (normalizedProposal.executed || !normalizedProposal.currentRoundProposal) {
        acc.pastProposalsIds.push(normalizedProposal.id)
      }

      return acc
    },
    {
      currentRoundProposalsIds: [],
      pastProposalsIds: [],
      allProposalsIds: [],
      proposalsMapper: {},
    },
  )
}

const calcGovPhase = (round: number) =>
  round === 0 ? GovPhases.PROPOSAL : round === 1 ? GovPhases.VOTING : GovPhases.TIMELOCK

export const normalizeGovernanceConfig = (
  currentGovernance: GovernanceGraphQL,
): Omit<GovernanceConfigState, 'isLoaded'> => {
  return {
    address: currentGovernance.address,
    fee: calcWithoutMu(currentGovernance.proposal_submission_fee_mutez),
    successReward: calcWithoutPrecision(currentGovernance.success_reward),
    proposalDescriptionMaxLength:
      currentGovernance.proposal_description_max_length ?? defaultProposalDescriptionMaxLength,
    proposalInvoiceMaxLength: currentGovernance.proposal_invoice_max_length ?? defaultProposalInvoiceMaxLength,
    proposalMetadataTitleMaxLength:
      currentGovernance.proposal_source_code_max_length ?? defaultProposalMetadataTitleMaxLength,
    proposalSourceCodeMaxLength:
      currentGovernance.proposal_source_code_max_length ?? defaultProposalSourceCodeMaxLength,
    proposalTitleMaxLength: currentGovernance.proposal_title_max_length ?? defaultProposalTitleMaxLength,

    currentRoundEndLevel: currentGovernance.current_round_end_level ?? 0,
    cycle: currentGovernance.cycle_id ?? 0,
    timelockProposalId: currentGovernance.timelock_proposal_id ?? 0,
    cycleHighestVotedProposalId: currentGovernance.cycle_highest_voted_proposal_id ?? 0,

    // TODO: check this value usage
    cycleCounter: 0,

    governancePhase: calcGovPhase(currentGovernance.current_round),
  }
}

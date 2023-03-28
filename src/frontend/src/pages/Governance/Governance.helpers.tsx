import { GovernancePhase, GovernanceState } from '../../reducers/governance'
import {
  ProposalStatus,
  ProposalRecordType,
  GovernanceProposalGraphQL,
  GovernanceGraphQL,
} from '../../utils/TypesAndInterfaces/Governance'
import { calcWithoutMu, calcWithoutPrecision } from '../../utils/calcFunctions'
import { DipDupTokensGraphQl } from 'utils/TypesAndInterfaces/DipDupTokens'

// helpers
import {
  defaultProposalInvoiceMaxLength,
  defaultProposalMetadataTitleMaxLength,
  defaultProposalDescriptionMaxLength,
  defaultProposalTitleMaxLength,
  defaultProposalSourceCodeMaxLength,
} from 'app/App.components/Input/Input.constants'

export const getProposalStatusInfo = (
  governancePhase: GovernancePhase,
  proposal: ProposalRecordType | undefined,
  timelockProposalId: number,
  isProposalPhase: boolean,
  cycleHighestVotedProposalId: number,
  cycleCounter: number,
): {
  statusFlag: ProposalStatus
  satelliteAbleToMakeProposalRoundVote: boolean
  showWaitingForExecutionHeader: boolean
  anyUserCanExecuteProposal: boolean
  showWaitingForPaymentToBeProcessedHeader: boolean
  anyUserCanProcessProposalPayment: boolean
  satelliteAbleToMakeVotingRoundVote: boolean
} => {
  // let statusFlag = ProposalStatus.ACTIVE
  let statusFlag = ProposalStatus.DROPPED
  let satelliteAbleToMakeProposalRoundVote = false
  let showWaitingForExecutionHeader = false
  let anyUserCanExecuteProposal = false
  let showWaitingForPaymentToBeProcessedHeader = false
  let anyUserCanProcessProposalPayment = false
  let satelliteAbleToMakeVotingRoundVote = false
  const isProposalRound = governancePhase === 'PROPOSAL'
  const isVotingRound = governancePhase === 'VOTING'
  const isTimeLockRound = governancePhase === 'TIME_LOCK'

  if (isProposalPhase) {
    if (isProposalRound) {
      // is Proposal Period
      if (proposal?.currentRoundProposal) {
        if (proposal?.locked) {
          statusFlag = ProposalStatus.LOCKED
          satelliteAbleToMakeProposalRoundVote = true
        } else {
          statusFlag = ProposalStatus.UNLOCKED
          satelliteAbleToMakeProposalRoundVote = false
        }
        // if proposal from a previous round and their id matches the id of the proposal from the timelock round
      } else if (timelockProposalId === proposal?.id) {
        if (!proposal?.executed) {
          statusFlag = ProposalStatus.WAITING
          showWaitingForExecutionHeader = true
          anyUserCanExecuteProposal = true // Already passed the voting and just waiting to be executed
        } else if (!proposal.paymentProcessed && proposal?.proposalPayments && proposal?.proposalPayments?.length > 0) {
          statusFlag = ProposalStatus.WAITING
          showWaitingForPaymentToBeProcessedHeader = true
          anyUserCanProcessProposalPayment = true // Already executed and just need the payment to be processed
        } else {
          //Don't show the proposal as its already executed
        }
      } else {
        statusFlag = ProposalStatus.DROPPED
      }
    }

    if (isVotingRound) {
      // If proposal is of current round
      // NEW: && if the proposal's id === the cycle_highest_voted_proposal_id in the GovernanceState
      if (proposal?.currentRoundProposal && proposal.id === cycleHighestVotedProposalId) {
        statusFlag = ProposalStatus.ONGOING
        satelliteAbleToMakeVotingRoundVote = true
      }
      //There is only 1 proposal to be shown during the voting round
    }

    if (isTimeLockRound) {
      // Timelock Period
      // If proposal is of current round
      // NEW: && if the proposal's id === the timelock_proposal_id in the GovernanceState
      if (proposal?.currentRoundProposal && proposal.id === timelockProposalId) {
        statusFlag = ProposalStatus.TIMELOCK
      }
      //There is only 1 proposal to be shown during the timelock
      // round and not able to vote on it at all
    }

    if (!isProposalRound && !isVotingRound && !isTimeLockRound) {
      if (proposal?.status === 1) {
        statusFlag = ProposalStatus.DROPPED
      } else {
        if (proposal?.executed) {
          statusFlag = ProposalStatus.EXECUTED
        } else if (proposal?.locked) {
          statusFlag = ProposalStatus.LOCKED
        }
      }
    }
  } else {
    // If a proposal is not of the current round so its a past proposal
    // Assuming its a proposal that has been executed or defeated. Not one that
    // is waiting to be executed / have its payment processed. STILL need to check
    // for this to show it on the main proposals page
    // if (!proposal?.currentRoundProposal && proposal && proposal?.cycle < cycleCounter) {
    if (!proposal?.currentRoundProposal && proposal) {
      if (proposal?.executed) {
        statusFlag = ProposalStatus.EXECUTED
      } else {
        statusFlag = ProposalStatus.DEFEATED
      }
    }
  }
  return {
    statusFlag,
    satelliteAbleToMakeProposalRoundVote,
    showWaitingForExecutionHeader,
    anyUserCanExecuteProposal,
    showWaitingForPaymentToBeProcessedHeader,
    anyUserCanProcessProposalPayment,
    satelliteAbleToMakeVotingRoundVote,
  }
}

export const normalizeProposalStatus = (
  governancePhase: GovernancePhase,
  numberSatus: number,
  executed: boolean,
  locked: boolean,
  isProposalPhase: boolean,
): ProposalStatus => {
  let status = ProposalStatus.ACTIVE
  const isProposalRound = governancePhase === 'PROPOSAL'
  const isVotingRound = governancePhase === 'VOTING'
  const isTimeLockRound = governancePhase === 'TIME_LOCK'

  if (isProposalPhase) {
    if (isProposalRound) {
      if (locked) {
        status = ProposalStatus.LOCKED
      } else {
        status = ProposalStatus.UNLOCKED
      }
    }

    if (isVotingRound) {
      if (locked) {
        status = ProposalStatus.ONGOING
      }
    }

    if (isTimeLockRound) {
      if (locked) {
        status = ProposalStatus.TIMELOCK
      }
    }

    if (!isProposalRound && !isVotingRound && !isTimeLockRound) {
      if (numberSatus === 1) {
        status = ProposalStatus.DROPPED
      } else {
        if (executed) {
          status = ProposalStatus.EXECUTED
        } else if (locked) {
          status = ProposalStatus.LOCKED
        }
      }
    }
  } else {
    if (numberSatus === 1) {
      status = ProposalStatus.DROPPED
    } else {
      if (executed) {
        status = ProposalStatus.EXECUTED
      } else {
        status = ProposalStatus.DEFEATED
      }
    }
  }
  return status
}

const BEFORE_DIGIT = 24
const AFTER_DIGIT = 12
export const getShortByte = (
  byte: string,
  beforeDigit: number = BEFORE_DIGIT,
  afterDigit: number = AFTER_DIGIT,
): string => {
  const shortBype = byte.length
    ? [
        byte.substring(0, beforeDigit),
        byte.length > beforeDigit ? '...' : '',
        byte.length > beforeDigit ? byte.substring(byte.length - afterDigit) : '',
      ]
    : []

  return shortBype.join('')
}

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
): Omit<GovernanceState['proposals'], 'isLoaded'> => {
  return proposals.reduce<Omit<GovernanceState['proposals'], 'isLoaded'>>(
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

const calcGovPhase = (round: number) => (round === 0 ? 'PROPOSAL' : round === 1 ? 'VOTING' : 'TIME_LOCK')

export const normalizeGovernanceConfig = (
  currentGovernance: GovernanceGraphQL,
): Omit<GovernanceState['config'], 'isLoaded'> => {
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
    cycleCounter: 0,

    governancePhase: calcGovPhase(currentGovernance.current_round),
  }
}

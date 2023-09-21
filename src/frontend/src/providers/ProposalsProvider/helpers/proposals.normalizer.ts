// types
import { ProposalsDataQueryQuery } from 'utils/__generated__/graphql'
import { SatelliteVoteType } from 'providers/SatellitesProvider/satellites.provider.types'
import { ProposalIndexerType } from '../proposals.provider.types'
import { GovernanceConfigForProposalsNormalizationType } from './governanceConfig.normalizer'
import { ProposalRecordType } from './proposals.types'

// utils
import { convertNumberForClient } from 'utils/calcFunctions'
import { getProposalStatus } from './proposals.utils'

// consts
import { satelliteVoteSchema } from 'providers/SatellitesProvider/satellites.const'
import { MVK_DECIMALS } from 'utils/constants'
import { GovPhases, ProposalStatus } from './proposals.const'

export const normalizeProposal = (
  item: ProposalsDataQueryQuery['governance_proposal'][number],
  { governancePhase, cycleHighestVotedProposalId, timelockProposalId }: GovernanceConfigForProposalsNormalizationType,
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
    droppedTime: item?.dropped_datetime,
    defeatedTime: item?.defeated_datetime,
    executionTime: item?.execution_datetime,
    cycle: item.cycle,
    successReward: item.success_reward,
    sourceCode: item.source_code,

    // voting data
    passVoteMvkTotal: convertNumberForClient({ number: item.proposal_vote_smvk_total, grade: MVK_DECIMALS }),
    upvoteMvkTotal: convertNumberForClient({ number: item.yay_vote_smvk_total, grade: MVK_DECIMALS }),
    downvoteMvkTotal: convertNumberForClient({ number: item.nay_vote_smvk_total, grade: MVK_DECIMALS }),
    abstainMvkTotal: convertNumberForClient({ number: item.pass_vote_smvk_total, grade: MVK_DECIMALS }),
    quorumMvkTotal: convertNumberForClient({ number: item.quorum_smvk_total, grade: MVK_DECIMALS }),
    minQuorumPercentage: convertNumberForClient({ number: item.min_quorum_percentage, grade: 4 }),

    votes: item.votes.reduce<
      Array<{ vote: SatelliteVoteType; address: string; name: string; avatar: string; round: number }>
    >((acc, vote) => {
      try {
        const voteValue = satelliteVoteSchema.parse(vote.vote)
        acc.push({
          round: vote.round,
          address: vote.voter.address,
          name: vote.voter.satellites[0].name,
          vote: voteValue,
          avatar: vote.voter.satellites[0].image,
        })
      } catch (e) {
        console.error('governance_votes vote parse error: ', { e })
      } finally {
        return acc
      }
    }, []),

    proposalData: item.data.map((byte, idx) => ({
      ...byte,
      order: idx,
      isUnderTheDrop: false,
      isLocalBytes: false,
    })),

    proposalPayments: item.payments
      .map(({ to_, title, id, token_id, token_amount, token }) => ({
        id,
        to__id: to_?.address,
        title,
        token_address: token?.token_address,
        token_id,
        token_amount,
      }))
      .filter(({ token_address, to__id, token_amount }) => token_address && to__id && token_amount),
  }
}

export const normalizeProposals = ({
  indexerData,
  userAddress,
  governanceConfig,
}: {
  indexerData: ProposalIndexerType
  userAddress: string | null
  governanceConfig: GovernanceConfigForProposalsNormalizationType
}) => {
  return indexerData.governance_proposal.reduce<{
    currentRoundProposalsIds: Array<number>
    pastProposalsIds: Array<number>
    submissionProposalsIds: Array<number>
    waitingProposalsIdsToBeExecuted: Array<number>
    waitingProposalsIdsToBePaid: Array<number>
    proposalsMapper: Record<number, ProposalRecordType>
  }>(
    (acc, indexerProposal) => {
      const { governancePhase, timelockProposalId } = governanceConfig
      const isProposalRound = governancePhase === GovPhases.PROPOSAL

      const normalizedProposal = normalizeProposal(indexerProposal, governanceConfig)
      const { id, executed, status, currentRoundProposal, paymentProcessed, proposerId } = normalizedProposal

      acc.proposalsMapper[normalizedProposal.id] = normalizedProposal

      const isPastProposal =
        status === ProposalStatus.DROPPED || status === ProposalStatus.EXECUTED || status === ProposalStatus.DEFEATED

      // Add id of proposal to be executed proposal
      if (isProposalRound && !executed && timelockProposalId === id && !isPastProposal) {
        acc.waitingProposalsIdsToBeExecuted.push(id)
      }

      // Add id of proposal to be paid proposal
      if (isProposalRound && !executed && timelockProposalId === id && !paymentProcessed && !isPastProposal) {
        acc.waitingProposalsIdsToBePaid.push(id)
      }

      // Add id of past proposal
      if (isPastProposal) {
        acc.pastProposalsIds.push(id)
      }

      // Add id of current round proposal
      if (currentRoundProposal) {
        acc.currentRoundProposalsIds.push(id)
      }

      // Add id of user created live proposal
      if (currentRoundProposal && proposerId === userAddress) {
        acc.submissionProposalsIds.push(id)
      }

      return acc
    },
    {
      currentRoundProposalsIds: [],
      pastProposalsIds: [],
      submissionProposalsIds: [],
      waitingProposalsIdsToBeExecuted: [],
      waitingProposalsIdsToBePaid: [],
      proposalsMapper: {},
    },
  )
}

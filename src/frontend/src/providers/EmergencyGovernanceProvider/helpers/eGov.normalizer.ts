import dayjs from 'dayjs'

import { convertNumberForClient } from 'utils/calcFunctions'

import { ProposalStatus } from 'providers/ProposalsProvider/helpers/proposals.const'
import { MVN_DECIMALS } from 'utils/constants'

import { EGovProposalType } from '../emergencyGovernance.provider.types'
import { GetEGovAllProposalsQueryQuery } from 'utils/__generated__/graphql'

type eGovProposalVoterType = {
  voterAddress: string
  voteAmount: number
  voteTime: string
}

export const normalizeEGovProposal = (
  indexerProposal: GetEGovAllProposalsQueryQuery['emergency_governance_record'][number],
) => {
  const isActiveProposal = !indexerProposal.executed && dayjs().isBefore(indexerProposal.expiration_timestamp)
  const status = isActiveProposal
    ? ProposalStatus.WAITING
    : indexerProposal.executed
    ? ProposalStatus.EXECUTED
    : ProposalStatus.DEFEATED

  const proposalVoters = indexerProposal.voters.map<eGovProposalVoterType>((voteData) => ({
    voterAddress: voteData.voter.address,
    voteAmount: convertNumberForClient({ number: voteData.smvn_amount, grade: MVN_DECIMALS }),
    voteTime: voteData.timestamp,
  }))

  return {
    id: Number(indexerProposal.id),
    title: indexerProposal.title,
    description: indexerProposal.description,

    isActive: isActiveProposal,
    status,

    executed: indexerProposal.executed,
    startTimestamp: indexerProposal.start_timestamp ?? null,
    executionTimestamp: indexerProposal.execution_datetime ?? null,
    expirationTimestamp: indexerProposal.expiration_timestamp ?? null,

    proposerAddress: indexerProposal.proposer.address,

    smvnPercentageRequired: indexerProposal.smvn_percentage_required / 100,
    smvnRequiredForTrigger: convertNumberForClient({
      number: indexerProposal.smvn_required_for_trigger,
      grade: MVN_DECIMALS,
    }),
    totalSmvnVotes: convertNumberForClient({ number: indexerProposal.total_smvn_votes, grade: MVN_DECIMALS }),

    voters: proposalVoters,
  }
}

export const normalizeEGovProposals = (indexerData: GetEGovAllProposalsQueryQuery) => {
  return indexerData['emergency_governance_record'].reduce<{
    allProposals: Array<number>
    pastProposals: Array<number>
    ongoingProposals: Array<number>
    proposalsMapper: Record<number, EGovProposalType>
  }>(
    (acc, eGovProposal) => {
      const normalizedProposal = normalizeEGovProposal(eGovProposal)

      acc.allProposals.push(normalizedProposal.id)
      acc.proposalsMapper[normalizedProposal.id] = normalizedProposal

      if (normalizedProposal.isActive) {
        acc.ongoingProposals.push(normalizedProposal.id)
      } else {
        acc.pastProposals.push(normalizedProposal.id)
      }

      return acc
    },
    {
      allProposals: [],
      pastProposals: [],
      ongoingProposals: [],
      proposalsMapper: {},
    },
  )
}

import { ProposalRecordType } from 'providers/ProposalsProvider/helpers/proposals.types'
import { GovPhases } from 'providers/ProposalsProvider/helpers/proposals.const'
import { VotingTypes } from './voting.const'

export type VoteStatistics = {
  yayVotesMvnTotal: number
  nayVotesMvnTotal?: number
  passVotesMvnTotal?: number
  proposalUpVotesMvnTotal?: number
  unusedVotesMvnTotal: number
  quorum: number
}

export type VotingProps = {
  voteStatistics: VoteStatistics
  isVotingActive: boolean
  showVotingButtons?: boolean
  disableVotingButtons?: boolean
  handleVote?: (vote: VotingTypes) => void
  quorumText?: string
  buttonsToShow?: {
    yayBtn?: {
      text: string
    }
    nayBtn?: {
      text: string
    }
    passBtn?: {
      text: string
    }
  }
}

export type VotingProposalsProps = {
  voteStatistics: VoteStatistics
  selectedProposal: ProposalRecordType
  votingPhaseHandler?: (vote: VotingTypes) => void
  isAbleToMakeProposalRoundVote?: boolean
  handleProposalVote: () => void
  vote?: ProposalRecordType['votes'][number]
  govPhase: `${keyof typeof GovPhases}`
}

export type VotingBarProps = {
  voteStatistics: VoteStatistics
  quorumText?: string
}

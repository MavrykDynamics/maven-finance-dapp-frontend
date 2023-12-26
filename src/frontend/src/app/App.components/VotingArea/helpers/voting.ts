import { ProposalRecordType } from 'providers/ProposalsProvider/helpers/proposals.types'
import { GovPhases } from 'providers/ProposalsProvider/helpers/proposals.const'
import { VotingTypes } from './voting.const'

export type VoteStatistics = {
  forVotesMVNTotal: number
  againstVotesMVNTotal?: number
  abstainVotesMVNTotal?: number
  passVotesMVNTotal?: number
  unusedVotesMVNTotal: number
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
    forBtn?: {
      text: string
    }
    againsBtn?: {
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

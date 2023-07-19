import type { GovPhases, ProposalRecordType } from 'utils/TypesAndInterfaces/Governance'
import { VotingTypes } from './voting.const'

export type VoteStatistics = {
  forVotesMVKTotal: number
  againstVotesMVKTotal?: number
  abstainVotesMVKTotal?: number
  passVotesMVKTotal?: number
  unusedVotesMVKTotal: number
  quorum: number
}

export type VotingProps = {
  voteStatistics: VoteStatistics
  isVotingActive: boolean
  showVotingButtons?: boolean
  disableVotingButtons?: boolean
  handleVote?: (vote: `${VotingTypes}`) => void
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
  votingPhaseHandler?: () => void
  isAbleToMakeProposalRoundVote?: boolean
  handleProposalVote: () => void
  vote?: ProposalRecordType['votes'][number]
  govPhase: `${GovPhases}`
}

export type VotingBarProps = {
  voteStatistics: VoteStatistics
  quorumText?: string
}

import { getNumberInBounds } from 'utils/calcFunctions'
import { SatelliteRecordType } from '../satellites.provider.types'

export const getSatelliteParticipations = ({
  eGovProposalsAmount,
  finRequestsAmount,
  proposalsAmount,
  executedProposalAmount,
  satellite,
}: {
  satellite: SatelliteRecordType
  eGovProposalsAmount: number
  finRequestsAmount: number
  proposalsAmount: number
  executedProposalAmount: number
}) => {
  const { proposalsVotes, financialRequestsVotes, eGovVotes, executedVotedProposalsAmount } = satellite
  /**
   * @votingPartisipation how many votes satellite has participied
   */
  const satelliteVotesAmount = eGovVotes.length + proposalsVotes.length + financialRequestsVotes.length
  const totalVotingPeriods = eGovProposalsAmount + finRequestsAmount + proposalsAmount
  const votingPartisipation = getNumberInBounds(
    0,
    100,
    totalVotingPeriods === 0 ? 0 : (satelliteVotesAmount / totalVotingPeriods) * 100,
  )

  /**
   * @proposalParticipation how many proposals that satellite has voted "yes" were executed
   */
  const proposalParticipation = getNumberInBounds(
    0,
    100,
    executedProposalAmount === 0 ? 0 : (executedVotedProposalsAmount / executedProposalAmount) * 100,
  )

  return {
    proposalParticipation,
    votingPartisipation,
  }
}

import { calcPersent, getNumberInBounds } from 'utils/calcFunctions'
import {
  NOT_AN_ORACLE_ORACLE_STATUS,
  NO_RESPONSE_ORACLE_STATUS,
  RESPONDED_ORACLE_STATUS,
  SatelliteOracleStatusType,
  SatelliteRecordType,
} from '../satellites.provider.types'
import { MavrykTheme } from 'styles/interfaces'

export const getSatelliteParticipations = ({
  eGovProposalsAmount,
  finRequestsAmount,
  proposalsAmount,
  executedProposalAmount,
  satellite,
}: {
  satellite: SatelliteRecordType | null
  eGovProposalsAmount: number
  finRequestsAmount: number
  proposalsAmount: number
  executedProposalAmount: number
}) => {
  if (!satellite)
    return {
      proposalParticipation: 0,
      votingPartisipation: 0,
    }

  const { proposalsVotes, financialRequestsVotes, eGovVotes, executedVotedProposalsAmount } = satellite
  /**
   * @votingPartisipation how many votes satellite has participied
   */
  const satelliteVotesAmount = eGovVotes.length + proposalsVotes.length + financialRequestsVotes.length
  const totalVotingPeriods = eGovProposalsAmount + finRequestsAmount + proposalsAmount
  const votingPartisipation = getNumberInBounds(
    0,
    100,
    totalVotingPeriods === 0 ? 0 : calcPersent(satelliteVotesAmount, totalVotingPeriods),
  )

  /**
   * @proposalParticipation how many proposals that satellite has voted "yes" were executed
   */
  const proposalParticipation = getNumberInBounds(
    0,
    100,
    executedProposalAmount === 0 ? 0 : calcPersent(executedVotedProposalsAmount, executedProposalAmount),
  )

  return {
    proposalParticipation,
    votingPartisipation,
  }
}

export const findColorBasedOnStatus = (statusType: SatelliteOracleStatusType, theme: MavrykTheme) => {
  return statusType === RESPONDED_ORACLE_STATUS
    ? theme.upColor
    : statusType === NO_RESPONSE_ORACLE_STATUS || statusType === NOT_AN_ORACLE_ORACLE_STATUS
    ? theme.downColor
    : theme.warningColor
}

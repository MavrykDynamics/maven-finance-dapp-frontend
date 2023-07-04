import { calcPersent, getNumberInBounds } from 'utils/calcFunctions'

import { RESPONDED_ORACLE_STATUS, NO_RESPONSE_ORACLE_STATUS, NOT_AN_ORACLE_ORACLE_STATUS } from '../satellites.const'

import { SatelliteOracleStatusType, SatelliteRecordType } from '../satellites.provider.types'
import { MavrykTheme } from 'styles/interfaces'

export const getSatelliteParticipations = ({
  finRequestsAmount,
  proposalsAmount,
  satelliteGovActionsAmount,
  satellite,
}: {
  satellite: SatelliteRecordType | null
  finRequestsAmount: number
  proposalsAmount: number
  satelliteGovActionsAmount: number
}) => {
  if (!satellite)
    return {
      proposalParticipation: 0,
      votingPartisipation: 0,
    }

  const {
    proposalsVotesAmount,
    financialRequestsVotesAmount,
    satelliteActionVotesAmount,
    createdFinProposalsAmount,
    createdGovProposalsAmount,
    createdSatelliteGovProposalsAmount,
    satelliteActionVotingPeriods,
    governanceProposalsVotingPeriods,
    financialRequestsVotingPeriods,
  } = satellite

  const satelliteVotesAmount = proposalsVotesAmount + financialRequestsVotesAmount + satelliteActionVotesAmount
  const satelliteVotingPeriods =
    satelliteActionVotingPeriods + governanceProposalsVotingPeriods + financialRequestsVotingPeriods

  /**
   * @votingPartisipation how many votes satellite has participied
   */
  const votingPartisipation = getNumberInBounds(
    0,
    100,
    !satelliteVotesAmount || !satelliteVotingPeriods ? 0 : calcPersent(satelliteVotesAmount, satelliteVotingPeriods),
  )

  const initiatedProposalsAmount =
    createdFinProposalsAmount + createdGovProposalsAmount + createdSatelliteGovProposalsAmount
  const totalProposalCreated = finRequestsAmount + proposalsAmount + satelliteGovActionsAmount

  /**
   * @proposalParticipation how many proposals, requests, actions has user initiated to all their amount
   */
  const proposalParticipation = getNumberInBounds(
    0,
    100,
    !initiatedProposalsAmount || !totalProposalCreated
      ? 0
      : calcPersent(initiatedProposalsAmount, totalProposalCreated),
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

export function getTotalDelegatedMVK(
  satelliteIds: Array<SatelliteRecordType['address']>,
  satellitesMapper: Record<string, SatelliteRecordType>,
): number {
  if (!satelliteIds) return 0
  return satelliteIds.reduce(
    (sum, currentAddress) =>
      sum +
      Number(satellitesMapper[currentAddress].totalDelegatedAmount + satellitesMapper[currentAddress].sMvkBalance),
    0,
  )
}

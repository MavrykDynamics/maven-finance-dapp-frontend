import { calcPercent } from 'utils/calcFunctions'

import {
  EMPTY_SATELLITES_CONTEXT,
  NO_RESPONSE_ORACLE_STATUS,
  NOT_AN_ORACLE_ORACLE_STATUS,
  RESPONDED_ORACLE_STATUS,
  SATELLITE_DATA_SUB,
  SATELLITE_PARTICIPATION_DATA_SUB,
  SATELLITES_DATA_ACTIVE_SUB,
  SATELLITES_DATA_ALL_SUB,
  SATELLITES_DATA_ORACLES_SUB,
  SATELLITES_DATA_SINGLE_SUB,
} from '../satellites.const'

import {
  SatelliteOracleStatusType,
  SatelliteRecordType,
  SatellitesContext,
  SatellitesContextState,
  SatellitesSubsRecordType,
} from '../satellites.provider.types'
import { buildProviderReturnValue } from 'providers/common/utils/buildProviderReturnValue'
import {
  STATUS_FLAG_DOWN,
  STATUS_FLAG_UP,
  STATUS_FLAG_WARNING,
} from 'app/App.components/StatusFlag/StatusFlag.constants'

/**
 *
 * @param finRequestsAmount – total amount of created financial requests
 * @param proposalsAmount – total amount of created gov proposals
 * @param satelliteGovActionsAmount – total amount of created satellite gov actions
 * @param satellite – data of satellite
 * @returns @votingParticipation – how many votes satellite has participated and @proposalParticipation – how many proposals, requests, actions has user initiated to all their amount
 */
export const getSatelliteParticipation = ({
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
      votingParticipation: 0,
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

  const votingParticipation =
    !satelliteVotesAmount || !satelliteVotingPeriods ? 0 : calcPercent(satelliteVotesAmount, satelliteVotingPeriods)

  const initiatedProposalsAmount =
    createdFinProposalsAmount + createdGovProposalsAmount + createdSatelliteGovProposalsAmount
  const totalProposalCreated = finRequestsAmount + proposalsAmount + satelliteGovActionsAmount

  const proposalParticipation =
    !initiatedProposalsAmount || !totalProposalCreated ? 0 : calcPercent(initiatedProposalsAmount, totalProposalCreated)

  return {
    proposalParticipation,
    votingParticipation,
  }
}

export const getStatusColorBasedOnOracleType = (statusType: SatelliteOracleStatusType) => {
  return statusType === RESPONDED_ORACLE_STATUS
    ? STATUS_FLAG_UP
    : statusType === NO_RESPONSE_ORACLE_STATUS || statusType === NOT_AN_ORACLE_ORACLE_STATUS
    ? STATUS_FLAG_DOWN
    : STATUS_FLAG_WARNING
}

export function getTotalDelegatedMVN(
  satelliteIds: Array<SatelliteRecordType['address']>,
  satellitesMapper: Record<string, SatelliteRecordType>,
): number {
  if (!satelliteIds) return 0
  return satelliteIds.reduce(
    (sum, currentAddress) =>
      sum +
      Number(satellitesMapper[currentAddress].totalDelegatedAmount + satellitesMapper[currentAddress].sMvnBalance),
    0,
  )
}

export const getSatellitesProviderReturnValue = ({
  satellitesCtxState,
  satelliteAddressToSubscribe,
  activeSubs,
  changeSatellitesSubscriptionsList,
  setSatelliteAddressToSubscribe,
  isPaginationLoading,
}: {
  satellitesCtxState: DeepNullable<SatellitesContextState>
  satelliteAddressToSubscribe: string | null
  activeSubs: SatellitesSubsRecordType
  changeSatellitesSubscriptionsList: SatellitesContext['changeSatellitesSubscriptionsList']
  setSatelliteAddressToSubscribe: SatellitesContext['setSatelliteAddressToSubscribe']
  isPaginationLoading: boolean
}) => {
  const {
    satelliteGovActionsAmount,
    finRequestsAmount,
    proposalsAmount,
    satelliteMapper,
    activeSatellitesIds,
    allSatellitesIds,
    oraclesIds,
  } = satellitesCtxState
  const commonToReturn = {
    setSatelliteAddressToSubscribe,
    changeSatellitesSubscriptionsList,
  }

  const isSatelliteParticipationEmpty =
    satelliteGovActionsAmount === null || finRequestsAmount === null || proposalsAmount === null

  // check for loading values to calc satellite participation
  const isLoadingSatelliteParticipation = activeSubs[SATELLITE_PARTICIPATION_DATA_SUB] && isSatelliteParticipationEmpty

  // checking whether we loading all satellites
  const isLoadingAllSatellites =
    activeSubs[SATELLITE_DATA_SUB] === SATELLITES_DATA_ALL_SUB &&
    Object.keys(satelliteMapper ?? []).length !== allSatellitesIds?.length

  // check if we loading single satellite NOTE: checking whether satellite exists should be on component, not in provider
  const isLoadingSingleSatellite =
    activeSubs[SATELLITES_DATA_SINGLE_SUB] && satelliteAddressToSubscribe && isPaginationLoading

  /**
   * isLoading indicates whether provider is loading smth, so we need to show loader, not load in background, cases:
   * 1. handling initial loading, when provider returned value before component subscribed
   * 2. handling oracles satellites loading
   * 3. handling active satellites loading
   * 4. handling single satellite loading
   * 5. handling all satellites loading
   * 6. handling satellite participation loading
   */
  const isLoading =
    (activeSubs[SATELLITE_DATA_SUB] === SATELLITES_DATA_ORACLES_SUB && !oraclesIds) ||
    (activeSubs[SATELLITE_DATA_SUB] === SATELLITES_DATA_ACTIVE_SUB && !activeSatellitesIds) ||
    isLoadingSingleSatellite ||
    isLoadingAllSatellites ||
    isLoadingSatelliteParticipation ||
    isPaginationLoading

  const result = buildProviderReturnValue(satellitesCtxState, EMPTY_SATELLITES_CONTEXT, commonToReturn, Boolean(isLoading))

  // Override allSatellitesIds even during loading to prevent pagination blinking on satellite details page
  return {
    ...result,
    allSatellitesIds: allSatellitesIds ?? EMPTY_SATELLITES_CONTEXT['allSatellitesIds'],
  }
}

import { calcPersent } from 'utils/calcFunctions'

import {
  RESPONDED_ORACLE_STATUS,
  NO_RESPONSE_ORACLE_STATUS,
  NOT_AN_ORACLE_ORACLE_STATUS,
  EMPTY_SATELLITES_CONTEXT,
  SATELLITE_PARTICIPATION_DATA_SUB,
  SATELLITE_DATA_SUB,
  SATELLITES_DATA_ORACLES_SUB,
  SATELLITES_DATA_ACTIVE_SUB,
  SATELLITES_DATA_ALL_SUB,
  SATELLITES_DATA_SINGLE_SUB,
} from '../satellites.const'

import {
  SatelliteOracleStatusType,
  SatelliteRecordType,
  SatellitesContext,
  SatellitesContextState,
  SatellitesSubsRecordType,
} from '../satellites.provider.types'
import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault'
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
 * @returns @votingPartisipation – how many votes satellite has participied and @proposalParticipation – how many proposals, requests, actions has user initiated to all their amount
 */
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

  const votingPartisipation =
    !satelliteVotesAmount || !satelliteVotingPeriods ? 0 : calcPersent(satelliteVotesAmount, satelliteVotingPeriods)

  const initiatedProposalsAmount =
    createdFinProposalsAmount + createdGovProposalsAmount + createdSatelliteGovProposalsAmount
  const totalProposalCreated = finRequestsAmount + proposalsAmount + satelliteGovActionsAmount

  const proposalParticipation =
    !initiatedProposalsAmount || !totalProposalCreated ? 0 : calcPersent(initiatedProposalsAmount, totalProposalCreated)

  return {
    proposalParticipation,
    votingPartisipation,
  }
}

export const getStatusColorBasedOnOracleType = (statusType: SatelliteOracleStatusType) => {
  return statusType === RESPONDED_ORACLE_STATUS
    ? STATUS_FLAG_UP
    : statusType === NO_RESPONSE_ORACLE_STATUS || statusType === NOT_AN_ORACLE_ORACLE_STATUS
    ? STATUS_FLAG_DOWN
    : STATUS_FLAG_WARNING
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

export const getSatellitesProviderReturnValue = ({
  satellitesCtxState,
  satelliteAddressToSubsctibe,
  activeSubs,
  changeSatellitesSubscriptionsList,
  setSatelliteAddressToSubsctibe,
}: {
  satellitesCtxState: DeepNullable<SatellitesContextState>
  satelliteAddressToSubsctibe: string | null
  activeSubs: SatellitesSubsRecordType
  changeSatellitesSubscriptionsList: SatellitesContext['changeSatellitesSubscriptionsList']
  setSatelliteAddressToSubsctibe: SatellitesContext['setSatelliteAddressToSubsctibe']
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
    setSatelliteAddressToSubsctibe,
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
    activeSubs[SATELLITE_DATA_SUB] === SATELLITES_DATA_SINGLE_SUB &&
    satelliteAddressToSubsctibe &&
    !satelliteMapper?.[satelliteAddressToSubsctibe]

  // when we first visit page it will return empty satellites ctx and then apge will subscribe, so we need this cond to prevent empty page blinking
  const isAnySatellitesTypeInitialLoading =
    (activeSubs[SATELLITE_DATA_SUB] && !satelliteMapper) || (!activeSubs[SATELLITE_DATA_SUB] && !satelliteMapper)

  /**
   * isLoading indicates whethet provider is loading smth, so we need to show loader, not load in background, cases:
   * 1. handling initial loading, when provider returned value before component subscribed
   * 2. handling oracles satellites loading
   * 3. handling active satellites loading
   * 4. handling single satellite loading
   * 5. handling all satellites loading
   * 6. handling satellite participation loading
   */
  const isLoading =
    isAnySatellitesTypeInitialLoading ||
    (activeSubs[SATELLITE_DATA_SUB] === SATELLITES_DATA_ORACLES_SUB && !oraclesIds) ||
    (activeSubs[SATELLITE_DATA_SUB] === SATELLITES_DATA_ACTIVE_SUB && !activeSatellitesIds) ||
    isLoadingSingleSatellite ||
    isLoadingAllSatellites ||
    isLoadingSatelliteParticipation

  // TODO: loading satellites debug log, remove right before merge to dev
  // console.log({
  //   1: isAnySatellitesTypeInitialLoading,
  //   2: activeSubs[SATELLITE_DATA_SUB] === SATELLITES_DATA_ORACLES_SUB && !oraclesIds,
  //   3: activeSubs[SATELLITE_DATA_SUB] === SATELLITES_DATA_ACTIVE_SUB && !activeSatellitesIds,
  //   4: isLoadingSingleSatellite,
  //   5: isLoadingAllSatellites,
  //   6: isLoadingSatelliteParticipation,
  //   activeSubs,
  //   satelliteAddressToSubsctibe,
  //   satellitesCtxState,
  //   isLoading,
  // })

  // if provider is loading smth return loading true and default empty context (nonNullable)
  if (isLoading) {
    return {
      ...commonToReturn,
      ...EMPTY_SATELLITES_CONTEXT,
      // need to return allSatelliteIds from context to prevent pagination on satellite details page blinking
      allSatellitesIds: allSatellitesIds ?? EMPTY_SATELLITES_CONTEXT['allSatellitesIds'],
      isLoading: true,
    }
  }

  // if subscribed data loaded return loading false and contextState where all null values replaced with nonNullable value
  const nonNullableProviderValue = replaceNullValuesWithDefault<SatellitesContextState>(
    satellitesCtxState,
    EMPTY_SATELLITES_CONTEXT,
  )
  return {
    ...commonToReturn,
    ...nonNullableProviderValue,
    isLoading: false,
  }
}

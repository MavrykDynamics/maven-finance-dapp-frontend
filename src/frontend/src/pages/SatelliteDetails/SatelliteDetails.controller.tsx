import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { delegate, getDelegationStorage, undelegate } from 'pages/Satellites/Satellites.actions'
import { getGovernanceStorage } from 'pages/Governance/Governance.actions'
import { getSatelliteMetrics } from 'pages/Satellites/Satellites.helpers'
import { getEmergencyGovernanceStorage } from 'pages/EmergencyGovernance/EmergencyGovernance.actions'
import { rewardsCompound } from 'pages/Doorman/Doorman.actions'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getFeedsStorage } from 'pages/DataFeeds/DataFeeds.actions'
import { getSatelliteByAddress } from './SatelliteDetails.actions'
import { State } from 'reducers'

import { SatelliteDetailsView } from './SatelliteDetails.view'
import { getFinancialRequestStorage } from 'pages/FinacialRequests/FiancialRequest.actions'

export const SatelliteDetails = () => {
  const dispatch = useDispatch()
  const { currentSatellite } = useSelector((state: State) => state.delegation)
  const { feedsLedger, isLoaded: isFeedsLoaded } = useSelector((state: State) => state.dataFeeds)
  const { financialRequests, isLoaded: isFinancialRequestsLoaded } = useSelector(
    (state: State) => state.financialRequest,
  )
  const {
    governanceStorage: { proposalLedger },
    pastProposals,
  } = useSelector((state: State) => state.governance)
  const { eGovProposals, isLoaded: isEgovLoaded } = useSelector((state: State) => state.emergencyGovernance)
  const {
    accountPkh,
    user: { mySatelliteRewardsData, mySMvkTokenBalance },
  } = useSelector((state: State) => state.wallet)

  const { satelliteId } = useParams<{ satelliteId: string }>()

  const { isLoading } = useDataLoader(async () => {
    try {
      await Promise.all([
        !isFeedsLoaded && dispatch(getFeedsStorage()),
        !isEgovLoaded && dispatch(getEmergencyGovernanceStorage()),
        !isFinancialRequestsLoaded && dispatch(getFinancialRequestStorage()),
        dispatch(getGovernanceStorage()),
        dispatch(getSatelliteByAddress(satelliteId)),
        dispatch(getDelegationStorage()),
      ])
    } catch (e) {}
  }, [])

  const delegateCallback = (address: string) => {
    dispatch(delegate(address))
  }

  const undelegateCallback = (address: string) => {
    dispatch(undelegate(address))
  }

  const handleClaimRewards = () => {
    if (accountPkh) {
      dispatch(rewardsCompound(accountPkh))
    }
  }

  const satelliteMetrics = useMemo(
    () =>
      getSatelliteMetrics(
        pastProposals,
        proposalLedger,
        eGovProposals,
        currentSatellite,
        feedsLedger,
        financialRequests,
      ),
    [currentSatellite, eGovProposals, feedsLedger, financialRequests, pastProposals, proposalLedger],
  )

  return (
    <SatelliteDetailsView
      satellite={currentSatellite}
      userSatelliteReward={mySatelliteRewardsData}
      delegateCallback={delegateCallback}
      undelegateCallback={undelegateCallback}
      claimRewardsCallback={handleClaimRewards}
      userStakedBalanceInSatellite={mySMvkTokenBalance}
      satelliteMetrics={satelliteMetrics}
    />
  )
}

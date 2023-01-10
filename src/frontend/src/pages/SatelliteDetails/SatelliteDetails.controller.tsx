import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { State } from 'reducers'

import { SatelliteDetailsView } from './SatelliteDetails.view'

import { getSatelliteByAddress } from './SatelliteDetails.actions'
import { delegate, getDelegationStorage, getOracleStorage, undelegate } from 'pages/Satellites/Satellites.actions'
import { rewardsCompound } from 'pages/Doorman/Doorman.actions'
import { getSatelliteMetrics } from 'pages/Satellites/Satellites.helpers'
import { getGovernanceStorage } from 'pages/Governance/Governance.actions'

export const SatelliteDetails = () => {
  const dispatch = useDispatch()
  const { currentSatellite } = useSelector((state: State) => state.delegation)
  const { feeds } = useSelector((state: State) => state.oracles.oraclesStorage)
  const {
    governanceStorage: { financialRequestLedger, proposalLedger },
    pastProposals,
  } = useSelector((state: State) => state.governance)
  const {
    emergencyGovernanceStorage: { emergencyGovernanceLedger },
  } = useSelector((state: State) => state.emergencyGovernance)
  const {
    accountPkh,
    user: { mySatelliteRewardsData, mySMvkTokenBalance },
  } = useSelector((state: State) => state.wallet)

  let { satelliteId } = useParams<{ satelliteId: string }>()

  useEffect(() => {
    dispatch(getSatelliteByAddress(satelliteId))
    dispatch(getDelegationStorage())
    dispatch(getOracleStorage())
    dispatch(getGovernanceStorage())
  }, [dispatch, satelliteId])

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
        emergencyGovernanceLedger,
        currentSatellite,
        feeds,
        financialRequestLedger,
      ),
    [currentSatellite],
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

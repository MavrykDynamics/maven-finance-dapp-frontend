import React, { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// types
import { State } from 'reducers'

// view
import SatellitesView from './Satellites.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

// consts, helpers, actions
import { getDoormanStorage } from 'pages/Doorman/Doorman.actions'
import { getTotalDelegatedMVK } from './helpers/Satellites.consts'
import { delegate, getDelegationStorage, undelegate } from 'pages/Satellites/Satellites.actions'
import { getGovernanceStorage } from 'pages/Governance/Governance.actions'
import { getEmergencyGovernanceStorage } from 'pages/EmergencyGovernance/EmergencyGovernance.actions'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getFeedsStorage } from 'pages/DataFeeds/DataFeeds.actions'

const Satellites = () => {
  const {
    delegationStorage: { activeSatellites = [] },
  } = useSelector((state: State) => state.delegation)
  const { feedsLedger, isLoaded: isFeedsLoaded } = useSelector((state: State) => state.dataFeeds)
  const { isLoaded: isEgovLoaded } = useSelector((state: State) => state.emergencyGovernance)
  const {
    user: { mySMvkTokenBalance, satelliteMvkIsDelegatedTo },
    accountPkh,
  } = useSelector((state: State) => state.wallet)
  const dispatch = useDispatch()

  const { isLoading } = useDataLoader(async () => {
    await Promise.all([
      !isFeedsLoaded && dispatch(getFeedsStorage()),
      !isEgovLoaded && dispatch(getEmergencyGovernanceStorage()),
      accountPkh && dispatch(getDoormanStorage()),
      dispatch(getDelegationStorage()),
      dispatch(getGovernanceStorage()),
    ])
  }, [accountPkh])

  const totalDelegatedMVK = getTotalDelegatedMVK(activeSatellites)

  const tabsInfo = useMemo(
    () => ({
      totalDelegetedMVK: <CommaNumber value={totalDelegatedMVK} endingText={'MVK'} />,
      totalSatelliteOracles: activeSatellites.length,
      numberOfDataFeeds: feedsLedger.length > 50 ? feedsLedger.length + '+' : feedsLedger.length,
    }),
    [activeSatellites, feedsLedger, totalDelegatedMVK],
  )

  const delegateCallback = (satelliteAddress: string) => {
    dispatch(delegate(satelliteAddress))
  }

  const undelegateCallback = (delegateAddress: string) => {
    dispatch(undelegate(delegateAddress))
  }

  return (
    <SatellitesView
      tabsInfo={tabsInfo}
      delegateCallback={delegateCallback}
      oracleSatellitesData={{
        userStakedBalance: mySMvkTokenBalance,
        satelliteUserIsDelegatedTo: satelliteMvkIsDelegatedTo,
        items: activeSatellites.slice(0, 3),
        delegateCallback,
        undelegateCallback,
      }}
      dataFeedsData={{ items: feedsLedger }}
    />
  )
}

export default Satellites

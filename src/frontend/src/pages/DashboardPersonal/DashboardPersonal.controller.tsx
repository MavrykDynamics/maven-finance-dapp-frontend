import { useParams } from 'react-router'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Redirect, Route, Switch } from 'react-router-dom'

import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getGovernanceStorage } from 'pages/Governance/Governance.actions'
import { getDelegationStorage, getOracleStorage } from 'pages/Satellites/Satellites.actions'
import { updateUserData } from 'pages/Doorman/Doorman.actions'
import { getEmergencyGovernanceStorage } from 'pages/EmergencyGovernance/EmergencyGovernance.actions'
import { isValidId, PORTFOLIO_TAB_ID, DELEGATION_TAB_ID, SATELLITE_TAB_ID } from './DashboardPersonal.utils'

import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { Page } from 'styles/components'
import DashboardPersonalEarningsHistory from './DashboardPersonalComponents/DashboardPersonalEarningsHistory'
import DashboardPersonalMyRewards from './DashboardPersonalComponents/DashboardPersonalMyRewards'
import DelegationTab from './DashboardPersonalComponents/DelegationTab'
import PortfolioTab from './DashboardPersonalComponents/PortfolioTab'
import { DashboardPersonalStyled } from './DashboardPersonal.style'
import SatelliteTab from './DashboardPersonalComponents/SatelliteTab'

import { State } from 'reducers'
import { claimAllRewardsAction } from './DashboardPersonal.actions'

const DashboardPersonal = () => {
  const dispatch = useDispatch()
  const { tabId } = useParams<{ tabId: string }>()

  const {
    tokensPrices: { tezos, mvk: { usd: mvkExchangeRate = 0 } = {} },
  } = useSelector((state: State) => state.tokens)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    user: {
      myMvkTokenBalance,
      mySMvkTokenBalance,
      myXTZTokenBalance,
      mytzBTCTokenBalance,
      isSatellite,
      myDoormanRewardsData: { myAvailableDoormanRewards },
      myFarmRewardsData,
      mySatelliteRewardsData: { myAvailableSatelliteRewards },
      userRewardsToDate: { satelliteRewards, farmRewards, doormanRewards },
    },
  } = useSelector((state: State) => state.wallet)

  const claimRewards = async () => {
    await claimAllRewardsAction()
    console.log('claim rewards in DashboardPersonal')
  }

  const { isLoading: isUserLoansLoading } = useDataLoader(async () => {
    try {
      await dispatch(getGovernanceStorage())
      await dispatch(getOracleStorage())
      await dispatch(getDelegationStorage())
      await dispatch(getEmergencyGovernanceStorage())
      await dispatch(updateUserData())
    } catch (e) {}
  }, [accountPkh])

  const rewards = {
    rewardsToClaim:
      myAvailableDoormanRewards +
      myAvailableSatelliteRewards +
      Object.values(myFarmRewardsData).reduce((acc, { myAvailableFarmRewards }) => (acc += myAvailableFarmRewards), 0),
    earnedRewards: satelliteRewards + farmRewards + doormanRewards,
  }

  const earnings = {
    mvkRate: mvkExchangeRate,
    xtzRate: tezos?.usd ?? 0,
    satelliteRewards: satelliteRewards,
    farmsRewards: farmRewards,
    exitRewards: doormanRewards,
    lendingIncome: 3131.31,
  }

  const walletData = {
    xtzAmount: myXTZTokenBalance,
    sMVKAmount: mySMvkTokenBalance,
    notsMVKAmount: myMvkTokenBalance,
    tzBTCAmount: mytzBTCTokenBalance,
  }

  const activeTab = useMemo(() => (isValidId(tabId) ? tabId : PORTFOLIO_TAB_ID), [tabId])

  return (
    <Page>
      <PageHeader page={'dashboard'} avatar={'/images/default-avatar.png'} />

      <DashboardPersonalStyled>
        <div className="top">
          <DashboardPersonalMyRewards {...rewards} claimRewardsHandler={claimRewards} />
          <DashboardPersonalEarningsHistory {...earnings} />
        </div>
        <div className="tabs-switchers">
          <Link
            to={`/dashboard-personal/${PORTFOLIO_TAB_ID}`}
            className={activeTab === PORTFOLIO_TAB_ID ? 'selected' : ''}
          >
            Portfolio
          </Link>
          <Link
            to={`/dashboard-personal/${isSatellite ? SATELLITE_TAB_ID : DELEGATION_TAB_ID}`}
            className={activeTab === (isSatellite ? SATELLITE_TAB_ID : DELEGATION_TAB_ID) ? 'selected' : ''}
          >
            {isSatellite ? 'Satellite' : 'Delegation'}
          </Link>
        </div>
        <div className={`bottom-grid ${activeTab}`}>
          <Switch>
            <Route exact path={`/dashboard-personal/${PORTFOLIO_TAB_ID}`}>
              <PortfolioTab {...walletData} isUserLoansLoading={isUserLoansLoading} />
            </Route>
            <Route exact path={`/dashboard-personal/${DELEGATION_TAB_ID}`}>
              <DelegationTab />
            </Route>
            <Route exact path={`/dashboard-personal/${SATELLITE_TAB_ID}`}>
              <SatelliteTab />
            </Route>

            <Redirect to={`/dashboard-personal/${PORTFOLIO_TAB_ID}`} />
          </Switch>
        </div>
      </DashboardPersonalStyled>
    </Page>
  )
}

export default DashboardPersonal

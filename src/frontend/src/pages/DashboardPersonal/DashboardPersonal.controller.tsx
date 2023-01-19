import { useParams } from 'react-router'
import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Redirect, Route, Switch } from 'react-router-dom'

import { getGovernanceStorage } from 'pages/Governance/Governance.actions'
import { getDelegationStorage, getOracleStorage } from 'pages/Satellites/Satellites.actions'
import { getEmergencyGovernanceStorage } from 'pages/EmergencyGovernance/EmergencyGovernance.actions'
import { isValidId, PORTFOLIO_TAB_ID, DELEGATION_TAB_ID, SATELLITE_TAB_ID } from './DashboardPersonal.utils'

import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { Page } from 'styles/components'
import DashboardPersonalEarningsHistory from './DashboardPersonalComponents/DashboardPersonalEarningsHistory'
import DashboardPersonalMyRewards from './DashboardPersonalComponents/DashboardPersonalMyRewards'
import DelegationTab from './DashboardPersonalComponents/DelegationTab'
import PortfolioTab from './DashboardPersonalComponents/PortfolioTab'
import SatelliteTab from './DashboardPersonalComponents/SatelliteTab'

import { State } from 'reducers'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { updateUserData } from 'pages/Doorman/Doorman.actions'
import { DashboardPersonalStyled } from './DashboardPersonal.style'

const DashboardPersonal = () => {
  const dispatch = useDispatch()
  const { tabId } = useParams<{ tabId: string }>()

  const {
    tokensPrices: { tezos },
  } = useSelector((state: State) => state.tokens)
  const { exchangeRate: mvkRate } = useSelector((state: State) => state.mvkToken)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    user: {
      myDoormanRewardsData,
      myFarmRewardsData,
      mySatelliteRewardsData,
      myMvkTokenBalance,
      mySMvkTokenBalance,
      myXTZTokenBalance,
      mytzBTCTokenBalance,
      isSatellite,
    },
  } = useSelector((state: State) => state.wallet)

  const claimRewards = useCallback(() => {
    console.log('claim rewards in DashboardPersonal')
  }, [])

  const { isLoading: isGenDataLoading } = useDataLoader(async () => {
    try {
      await dispatch(getGovernanceStorage())
      await dispatch(getOracleStorage())
      await dispatch(getDelegationStorage())
      await dispatch(getEmergencyGovernanceStorage())
    } catch (e) {}
  }, [accountPkh])

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
    rewardsToClaim: 234234,
    earnedRewards: 23324,
  }

  const earnings = {
    mvkRate,
    xtzRate: tezos?.usd ?? 1,
    satelliteRewards: 232323,
    governanceRewards: 313,
    farmsRewards: 3131.31,
    exitRewards: 131,
    maxSupply: 31.13123,
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

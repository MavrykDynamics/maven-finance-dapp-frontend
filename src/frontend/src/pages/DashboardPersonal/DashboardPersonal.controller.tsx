import { useLocation, useParams } from 'react-router'
import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Redirect, Route, Switch } from 'react-router-dom'

import { State } from 'reducers'

import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getGovernanceStorage } from 'pages/Governance/Governance.actions'
import { getFeedsStorage } from 'pages/DataFeeds/DataFeeds.actions'
import { claimAllRewardsAction } from './DashboardPersonal.actions'
import { updateUserData } from 'reducers/actions/user.actions'
import { getEmergencyGovernanceStorage } from 'pages/EmergencyGovernance/EmergencyGovernance.actions'
import {
  isValidId,
  PORTFOLIO_TAB_ID,
  DELEGATION_TAB_ID,
  SATELLITE_TAB_ID,
  VESTING_TAB_ID,
  PORTFOLIO_LENDING_TAB_ID,
  PORTFOLIO_LENDING_TAB_ID,
  PORTFOLIO_BORROWING_TAB_ID,
} from './DashboardPersonal.utils'
import {
  USER_ACTIONS_HISTORY,
  calculateSlicePositions,
  PAGINATION_SIDE_CENTER,
  getPageNumber,
} from 'app/App.components/Pagination/pagination.consts'

import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { Page } from 'styles/components'
import DashboardPersonalEarningsHistory from './DashboardPersonalComponents/DashboardPersonalEarningsHistory'
import DashboardPersonalMyRewards from './DashboardPersonalComponents/DashboardPersonalMyRewards'
import DelegationTab from './DashboardPersonalComponents/DelegationTab'
import PortfolioTab from './DashboardPersonalComponents/PortfolioTab'
import { DashboardPersonalStyled } from './DashboardPersonal.style'
import SatelliteTab from './DashboardPersonalComponents/SatelliteTab'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from 'app/App.components/Table/Table.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import {
  DashboardPersonalTabStyled,
  HistoryBlock,
} from './DashboardPersonalComponents/DashboardPersonalComponents.style'
import { getVestingStorage } from 'pages/Treasury/Treasury.actions'
import VestingTab from './DashboardPersonalComponents/VestingTab'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import Button from 'app/App.components/Button/NewButton'
import { BUTTON_NAVIGATION } from 'app/App.components/Button/Button.constants'

const DashboardPersonal = () => {
  const dispatch = useDispatch()
  const { tabId } = useParams<{ tabId: string }>()

  const {
    tokensPrices: { tezos, mvk: { usd: mvkExchangeRate = 0 } = {} },
  } = useSelector((state: State) => state.tokens)
  const { isLoaded: isEgovLoaded } = useSelector((state: State) => state.emergencyGovernance)
  const {
    accountPkh,
    user: { isVestee },
  } = useSelector((state: State) => state.wallet)
  const { isLoaded: isFeedsLoaded } = useSelector((state: State) => state.dataFeeds)
  const { isLoaded: isVestingLoaded } = useSelector((state: State) => state.vesting)
  const {
    user: {
      myMvkTokenBalance,
      mySMvkTokenBalance,
      myXTZTokenBalance,
      mytzBTCTokenBalance,
      myLendingRewardsAmount,
      isSatellite,
      myDoormanRewardsData: { myAvailableDoormanRewards },
      myFarmRewardsData,
      mySatelliteRewardsData: { myAvailableSatelliteRewards },
      userRewardsToDate: { satelliteRewards, farmRewards, doormanRewards },
      isLoaded: isUserDataLoaded,
    },
  } = useSelector((state: State) => state.wallet)

  const claimRewards = async () => {
    await dispatch(claimAllRewardsAction())
  }

  const { isLoading } = useDataLoader(async () => {
    try {
      await Promise.all(
        [
          dispatch(getGovernanceStorage()),
          !isEgovLoaded && dispatch(getEmergencyGovernanceStorage()),
          isVestee && !isVestingLoaded && dispatch(getVestingStorage()),
          !isFeedsLoaded && dispatch(getFeedsStorage()),
        ].filter(Boolean),
      )
    } catch (e) {}
  }, [accountPkh])

  const { isLoading: isUserLoansLoading } = useDataLoader(async () => {
    try {
      if (!isUserDataLoaded) {
        await dispatch(updateUserData())
      }
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
    lendingIncome: myLendingRewardsAmount,
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

        {isLoading ? (
          <DataLoaderWrapper>
            <ClockLoader width={150} height={150} />
            <div className="text">Loading your statistic</div>
          </DataLoaderWrapper>
        ) : (
          <>
            <div className="tabs-switchers">
              <Link to={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_LENDING_TAB_ID}`}>
                <Button selected={activeTab === PORTFOLIO_TAB_ID} kind={BUTTON_NAVIGATION}>
                  Portfolio
                </Button>
              </Link>
              <Link to={`/dashboard-personal/${isSatellite ? SATELLITE_TAB_ID : DELEGATION_TAB_ID}`}>
                <Button
                  selected={activeTab === (isSatellite ? SATELLITE_TAB_ID : DELEGATION_TAB_ID)}
                  kind={BUTTON_NAVIGATION}
                >
                  {isSatellite ? 'Satellite' : 'Delegation'}
                </Button>
              </Link>
              {isVestee ? (
                <Link to={`/dashboard-personal/${VESTING_TAB_ID}`}>
                  <Button selected={activeTab === VESTING_TAB_ID} kind={BUTTON_NAVIGATION}>
                    Vesting
                  </Button>
                </Link>
              ) : null}
            </div>

            <div className={`bottom-grid ${activeTab}`}>
              <DashboardPersonalTabStyled>
                <Switch>
                  <Route exact path={`/dashboard-personal/${PORTFOLIO_TAB_ID}/:secondaryTabId?`}>
                    <PortfolioTab {...walletData} isUserLoansLoading={isUserLoansLoading} />
                  </Route>
                  <Route exact path={`/dashboard-personal/${DELEGATION_TAB_ID}`}>
                    <DelegationTab />
                  </Route>
                  <Route exact path={`/dashboard-personal/${SATELLITE_TAB_ID}`}>
                    <SatelliteTab />
                  </Route>
                  <Route exact path={`/dashboard-personal/${VESTING_TAB_ID}`}>
                    <VestingTab />
                  </Route>

                  <Redirect to={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_LENDING_TAB_ID}`} />
                </Switch>
              </DashboardPersonalTabStyled>
            </div>
          </>
        )}
      </DashboardPersonalStyled>
    </Page>
  )
}

export default DashboardPersonal

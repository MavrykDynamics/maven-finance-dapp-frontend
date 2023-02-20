import { useLocation, useParams } from 'react-router'
import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Redirect, Route, Switch } from 'react-router-dom'

import { State } from 'reducers'

import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getGovernanceStorage } from 'pages/Governance/Governance.actions'
import { getFeedsStorage } from 'pages/DataFeeds/DataFeeds.actions'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { getSatellitesStorage } from 'pages/Satellites/Satellites.actions'
import { claimAllRewardsAction } from './DashboardPersonal.actions'
import { updateUserData } from 'reducers/actions/user.actions'
import { getEmergencyGovernanceStorage } from 'pages/EmergencyGovernance/EmergencyGovernance.actions'
import { isValidId, PORTFOLIO_TAB_ID, DELEGATION_TAB_ID, SATELLITE_TAB_ID } from './DashboardPersonal.utils'
import {
  USER_ACTIONS_HISTORY,
  calculateSlicePositions,
  PAGINATION_SIDE_CENTER,
} from 'pages/FinacialRequests/Pagination/pagination.consts'

import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { Page } from 'styles/components'
import DashboardPersonalEarningsHistory from './DashboardPersonalComponents/DashboardPersonalEarningsHistory'
import DashboardPersonalMyRewards from './DashboardPersonalComponents/DashboardPersonalMyRewards'
import DelegationTab from './DashboardPersonalComponents/DelegationTab'
import PortfolioTab from './DashboardPersonalComponents/PortfolioTab'
import { DashboardPersonalStyled } from './DashboardPersonal.style'
import SatelliteTab from './DashboardPersonalComponents/SatelliteTab'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'
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

const DashboardPersonal = () => {
  const dispatch = useDispatch()
  const { tabId } = useParams<{ tabId: string }>()

  const {
    tokensPrices: { tezos, mvk: { usd: mvkExchangeRate = 0 } = {} },
  } = useSelector((state: State) => state.tokens)
  const { isLoaded: isEgovLoaded } = useSelector((state: State) => state.emergencyGovernance)
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { isLoaded: isFeedsLoaded } = useSelector((state: State) => state.dataFeeds)
  const { isLoaded: isSatellitesLoaded } = useSelector((state: State) => state.satellites)
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
      actionsHistory,
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
          !isSatellitesLoaded && dispatch(getSatellitesStorage()),
          !isEgovLoaded && dispatch(getEmergencyGovernanceStorage()),
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

  const { search, pathname } = useLocation()
  const currentPage = getPageNumber(search, USER_ACTIONS_HISTORY)
  const paginatedTableRows = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, USER_ACTIONS_HISTORY)
    return actionsHistory?.slice(from, to)
  }, [currentPage, actionsHistory])

  const showHistoryData = pathname !== `/dashboard-personal/${PORTFOLIO_TAB_ID}`

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
          <DashboardPersonalTabStyled>
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

            {showHistoryData ? (
              <HistoryBlock>
                <GovRightContainerTitleArea>
                  <h2>History</h2>
                </GovRightContainerTitleArea>
                {actionsHistory ? (
                  <Table className="treasury-table">
                    <TableHeader className="treasury">
                      <TableRow>
                        <TableHeaderCell>Action</TableHeaderCell>
                        <TableHeaderCell>Amount, MVK</TableHeaderCell>
                        <TableHeaderCell>
                          Total, MVK{' '}
                          <CustomTooltip
                            iconId="info"
                            className="history-tooltip"
                            text='For unstake, this is the amount received in MVK after the fee is deducted. For the rest, same as the "Amount, MVK" column'
                          />
                        </TableHeaderCell>
                        <TableHeaderCell contentPosition="right">Fee</TableHeaderCell>
                      </TableRow>
                    </TableHeader>

                    <TableBody className="treasury">
                      {paginatedTableRows.map(({ action, amount, fee, totalAmount, id }) => {
                        return (
                          <TableRow rowHeight={40} borderColor="dataColor" className="add-hover" key={id}>
                            <TableCell width="25%">{action}</TableCell>
                            <TableCell width="30%">
                              <CommaNumber value={amount} />
                            </TableCell>
                            <TableCell width="30%">
                              <CommaNumber value={totalAmount} />
                            </TableCell>
                            <TableCell width="20%" contentPosition="right">
                              <CommaNumber value={fee} endingText="%" />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="no-data">
                    <span>You do not have any previous actions history</span>
                  </div>
                )}

                <Pagination
                  itemsCount={actionsHistory?.length ?? 0}
                  listName={USER_ACTIONS_HISTORY}
                  side={PAGINATION_SIDE_CENTER}
                />
              </HistoryBlock>
            ) : null}
          </DashboardPersonalTabStyled>
        </div>
      </DashboardPersonalStyled>
    </Page>
  )
}

export default DashboardPersonal

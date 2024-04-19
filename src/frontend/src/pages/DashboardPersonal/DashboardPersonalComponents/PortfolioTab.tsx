import { useMemo } from 'react'
import { Link, Navigate, Route, Routes as Switch, useParams } from 'react-router-dom'

// consts
import { AREA_CHART_TYPE } from 'app/App.components/Chart/helpers/Chart.const'
import colors from 'styles/colors'
import { SPINNER_LOADER_LARGE } from 'app/App.components/Loader/loader.const'
import { BUTTON_NAVIGATION, BUTTON_SIMPLE } from 'app/App.components/Button/Button.constants'
import {
  isValidPersonalDashboardSecondaryTabId,
  PORTFOLIO_BORROWING_TAB_ID,
  PORTFOLIO_LENDING_TAB_ID,
  PORTFOLIO_POSITION_TAB_ID,
  PORTFOLIO_TAB_ID,
} from '../DashboardPersonal.utils'

// view
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Chart } from 'app/App.components/Chart/Chart'
import { LoansTxTab } from './LoansTxTab'
import { LendBorrowPosition } from './LendBorrowPosition'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { PortfolioChartStyled, PortfolioWalletStyled } from './DashboardPersonalComponents.style'
import Button from 'app/App.components/Button/NewButton'
import { Plug } from 'app/App.components/Chart/Chart.style'
import { DataLoaderWrapper, SpinnerCircleLoaderStyled } from 'app/App.components/Loader/Loader.style'
import Icon from 'app/App.components/Icon/Icon.view'

// hooks
import useUserLoansData from 'providers/UserProvider/hooks/useUserLoansData'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useUserEarningsHistory } from 'providers/UserProvider/hooks/useUserEarningsHistory'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

type PortfolioTabProps = {
  xtzAmount: number
  sMvnAmount: number
  mvnAmount: number
  mostSuppliedUserToken?: { amount: number; name: string }
}

const PortfolioTab = ({ xtzAmount, mostSuppliedUserToken, sMvnAmount, mvnAmount }: PortfolioTabProps) => {
  const { secondaryTabId = PORTFOLIO_LENDING_TAB_ID } = useParams<{ secondaryTabId: string }>()

  const { availableLoansRewards, userAddress } = useUserContext()
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()
  const {
    userBorrowings,
    totalUserBorrowed,
    totalUserLended,
    userVaultsData,
    userLendings,
    isLoading: isUserLoansLoading,
  } = useUserLoansData()
  const { isLoading: isUserEarhingHistoryLoading, earningHistory } = useUserEarningsHistory()

  const portfolioActiveTab = useMemo(
    () => (isValidPersonalDashboardSecondaryTabId(secondaryTabId) ? secondaryTabId : PORTFOLIO_LENDING_TAB_ID),
    [secondaryTabId],
  )

  const chartDataAverage = earningHistory.reduce((acc, { value }) => (acc += value), 0) / earningHistory.length

  const canShowChart = userAddress && earningHistory.length >= 2

  return (
    <>
      <PortfolioChartStyled>
        <H2Title>MVN Earning History</H2Title>
        <div className="content">
          {!canShowChart ? (
            <Plug>
              <div>
                <Icon id="stars" className="icon-stars" />
                <Icon id="cow" className="icon-cow" />
              </div>
              <p className="text">{!userAddress ? 'No data available' : "You haven't claimed any rewards yet"}</p>
            </Plug>
          ) : isUserEarhingHistoryLoading ? (
            <DataLoaderWrapper margin="0">
              <SpinnerCircleLoaderStyled className={SPINNER_LOADER_LARGE} />
              <div className="text">Loading your earning history data</div>
            </DataLoaderWrapper>
          ) : (
            <Chart
              numberOfItemsToDisplay={2}
              data={{ type: AREA_CHART_TYPE, plots: earningHistory }}
              colors={{
                lineColor: colors[themeSelected].primaryChartColor,
                areaTopColor: colors[themeSelected].primaryChartColor,
                areaBottomColor: colors[themeSelected].primaryChartBottomColor,
              }}
              tooltipAsset={'MVN'}
              settings={{
                priceMargins:
                  chartDataAverage < 1000
                    ? {
                        top: 0.2,
                        bottom: 0.05,
                      }
                    : { top: 0.3, bottom: 0.2 },
              }}
            />
          )}
        </div>
      </PortfolioChartStyled>

      <PortfolioWalletStyled>
        <H2Title>Wallet</H2Title>
        <div className="wallet-info">
          <div className="name">Staked MVN</div>
          <div className="value">
            <CommaNumber value={sMvnAmount} />
            <Link to={userAddress ? '/staking' : '#'}>
              <Button kind={BUTTON_SIMPLE} disabled={!userAddress}>
                View
              </Button>
            </Link>
          </div>
        </div>
        <div className="wallet-info">
          <div className="name">MVN Not Staked</div>
          <div className="value">
            <CommaNumber value={mvnAmount} />
            <Link to={userAddress ? '/staking' : '#'}>
              <Button kind={BUTTON_SIMPLE} disabled={!userAddress}>
                Stake
              </Button>
            </Link>
          </div>
        </div>
        <div className="wallet-info">
          <div className="name">XTZ in Wallet</div>
          <div className="value">
            <CommaNumber value={xtzAmount} />
            <a
              href={userAddress ? 'https://mavryk.finance/bakery' : '#'}
              target={userAddress ? '_blank' : undefined}
              rel="noreferrer"
            >
              <Button kind={BUTTON_SIMPLE} disabled={!userAddress}>
                Delegate
              </Button>
            </a>
          </div>
        </div>
        {mostSuppliedUserToken ? (
          <div className="wallet-info">
            <div className="name">{mostSuppliedUserToken.name} in Wallet</div>
            <div className="value">
              <CommaNumber value={mostSuppliedUserToken.amount} />
            </div>
          </div>
        ) : null}
      </PortfolioWalletStyled>

      <div className="tabs-switchers">
        <Link to={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_POSITION_TAB_ID}`}>
          <Button selected={portfolioActiveTab === PORTFOLIO_POSITION_TAB_ID} kind={BUTTON_NAVIGATION}>
            Earn/Borrow Position
          </Button>
        </Link>
        <Link to={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_LENDING_TAB_ID}`}>
          <Button selected={portfolioActiveTab === PORTFOLIO_LENDING_TAB_ID} kind={BUTTON_NAVIGATION}>
            Earn TXs
          </Button>
        </Link>
        <Link to={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_BORROWING_TAB_ID}`}>
          <Button selected={portfolioActiveTab === PORTFOLIO_BORROWING_TAB_ID} kind={BUTTON_NAVIGATION}>
            Borrow TXs
          </Button>
        </Link>
      </div>

      <Switch>
        <Route path={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_POSITION_TAB_ID}`}>
          <LendBorrowPosition
            totalUserBorrowed={totalUserBorrowed}
            totalUserLended={totalUserLended}
            userVaultsData={userVaultsData}
            userLoansRewards={availableLoansRewards}
            isUserLoansLoading={isUserLoansLoading}
          />
        </Route>
        <Route path={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_LENDING_TAB_ID}`}>
          <LoansTxTab txVariant="lending" userLoansData={userLendings} isUserLoansLoading={isUserLoansLoading} />
        </Route>
        <Route path={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_BORROWING_TAB_ID}`}>
          <LoansTxTab txVariant="borrowing" userLoansData={userBorrowings} isUserLoansLoading={isUserLoansLoading} />
        </Route>

        <Navigate to={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_POSITION_TAB_ID}`} />
      </Switch>
    </>
  )
}

export default PortfolioTab

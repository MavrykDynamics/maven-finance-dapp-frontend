import { useEffect, useMemo, useState } from 'react'
import { Link, Redirect, Route, Switch, useParams } from 'react-router-dom'

import { CHART_TEST_DATA } from '../tabs.const'
import { LOANS_MARKETS_DATA, DEFAULT_LOANS_ACTIVE_SUBS } from 'providers/LoansProvider/helpers/loans.const'
import { BUTTON_NAVIGATION, BUTTON_SIMPLE } from 'app/App.components/Button/Button.constants'
import {
  isValidPersonalDashboardSecondaryTabId,
  PORTFOLIO_BORROWING_TAB_ID,
  PORTFOLIO_LENDING_TAB_ID,
  PORTFOLIO_POSITION_TAB_ID,
  PORTFOLIO_TAB_ID,
} from '../DashboardPersonal.utils'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Chart } from 'app/App.components/Chart/Chart'
import {
  SlidingTabButtons,
  SlidingTabButtonType,
} from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { LoansTxTab } from './LoansTxTab'
import Button from 'app/App.components/Button/NewButton'

import { PortfolioChartStyled, PortfolioWalletStyled } from './DashboardPersonalComponents.style'
import { LendBorrowPosition } from './LendBorrowPosition'
import { AREA_CHART_TYPE } from 'app/App.components/Chart/helpers/Chart.const'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import useUserLoansData from 'providers/UserProvider/hooks/useUserLoansData'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'

type PortfolioTabProps = {
  xtzAmount: number
  sMVKAmount: number
  MVKAmount: number
  mostSuppliedUserToken?: { amount: number; name: string }
  isUserLoansLoading: boolean
}

const TOGGLE_VALUES: SlidingTabButtonType[] = [
  { id: 1, text: '24H', active: true },
  { id: 3, text: '1W', active: false },
  { id: 4, text: '1M', active: false },
  { id: 5, text: '1Y', active: false },
  { id: 6, text: 'All', active: false },
]

const PortfolioTab = ({
  xtzAmount,
  mostSuppliedUserToken,
  sMVKAmount,
  MVKAmount,
  isUserLoansLoading,
}: PortfolioTabProps) => {
  const { secondaryTabId } = useParams<{ secondaryTabId: string }>()

  const { availableLoansRewards, userAddress } = useUserContext()

  const { changeLoansSubscriptionsList, isLoading: isLoansLoading } = useLoansContext()

  useEffect(() => {
    changeLoansSubscriptionsList({
      [LOANS_MARKETS_DATA]: true,
    })

    return () => changeLoansSubscriptionsList(DEFAULT_LOANS_ACTIVE_SUBS)
  }, [])

  const portfolioActiveTab = useMemo(
    () => (isValidPersonalDashboardSecondaryTabId(secondaryTabId) ? secondaryTabId : PORTFOLIO_LENDING_TAB_ID),
    [secondaryTabId],
  )

  const { userBorrowings, totalUserBorrowed, totalUserLended, userVaultsData, userLendings, isLoading } =
    useUserLoansData()

  const [toggleItems, setToggleItems] = useState<SlidingTabButtonType[]>(TOGGLE_VALUES)
  const lastSeria = CHART_TEST_DATA.at(-1)?.value ?? 0

  return (
    <>
      {/* TODO: make this chart dynamic need data in indexer for it */}
      <PortfolioChartStyled>
        <H2Title>MVK Earning History</H2Title>
        <div className="chart-periods">
          <SlidingTabButtons
            tabItems={toggleItems}
            disabled
            onClick={(tabId) =>
              setToggleItems(
                toggleItems.map((item) => ({
                  ...item,
                  active: item.id === tabId,
                })),
              )
            }
          />
        </div>
        {/* <div className="last-seria">
          <div className="mvk">
            <CommaNumber endingText="MVK" value={lastSeria} />
          </div>
          <div className="usd">
            <CommaNumber beginningText="$" value={lastSeria * mvkExchangeRate} />
          </div>
        </div> */}
        <div className="chart">
          <Chart data={{ type: AREA_CHART_TYPE, plots: CHART_TEST_DATA }} tooltipAsset={'MVK'} comingSoon />
        </div>
      </PortfolioChartStyled>

      <PortfolioWalletStyled>
        <H2Title>Wallet</H2Title>
        <div className="wallet-info">
          <div className="name">Staked MVK</div>
          <div className="value">
            <CommaNumber value={sMVKAmount} />
            <Link to={userAddress ? '/staking' : '#'}>
              <Button kind={BUTTON_SIMPLE} disabled={!userAddress}>
                View
              </Button>
            </Link>
          </div>
        </div>
        <div className="wallet-info">
          <div className="name">MVK Not Staked</div>
          <div className="value">
            <CommaNumber value={MVKAmount} />
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
        <Route exact path={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_POSITION_TAB_ID}`}>
          <LendBorrowPosition
            totalUserBorrowed={totalUserBorrowed}
            totalUserLended={totalUserLended}
            userVaultsData={userVaultsData}
            userLoansRewards={availableLoansRewards}
          />
        </Route>
        <Route exact path={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_LENDING_TAB_ID}`}>
          <LoansTxTab txVariant="lending" userLoansData={userLendings} isUserLoansLoading={isUserLoansLoading} />
        </Route>
        <Route exact path={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_BORROWING_TAB_ID}`}>
          <LoansTxTab txVariant="borrowing" userLoansData={userBorrowings} isUserLoansLoading={isUserLoansLoading} />
        </Route>

        <Redirect to={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_POSITION_TAB_ID}`} />
      </Switch>
    </>
  )
}

export default PortfolioTab

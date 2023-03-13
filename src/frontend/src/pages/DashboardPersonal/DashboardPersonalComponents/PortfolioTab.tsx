import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, Redirect, Route, Switch, useParams } from 'react-router-dom'

import { State } from 'reducers'

import { CHART_TEST_DATA } from '../tabs.const'
import { BUTTON_PRIMARY, BUTTON_SIMPLE, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Chart } from 'app/App.components/Chart/Chart.view'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { SlidingTabButtons, TabItem } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import {
  LBHInfoBlock,
  ListItem,
  PortfolioWalletStyled,
  PortfolioChartStyled,
} from './DashboardPersonalComponents.style'
import {
  PORTFOLIO_BORROWING_TAB_ID,
  PORTFOLIO_LENDING_TAB_ID,
  PORTFOLIO_POSITION_TAB_ID,
  PORTFOLIO_TAB_ID,
} from '../DashboardPersonal.utils'

type PortfolioTabProps = {
  xtzAmount: number
  tzBTCAmount: number
  sMVKAmount: number
  notsMVKAmount: number
  isUserLoansLoading: boolean
}

const TOGGLE_VALUES: TabItem[] = [
  { id: 1, text: '24H', active: true },
  { id: 3, text: '1W', active: false },
  { id: 4, text: '1M', active: false },
  { id: 5, text: '1Y', active: false },
  { id: 6, text: 'All', active: false },
]

const PortfolioTab = ({ xtzAmount, tzBTCAmount, sMVKAmount, notsMVKAmount, isUserLoansLoading }: PortfolioTabProps) => {
  const { secondaryTabId } = useParams<{ secondaryTabId: string }>()
  const portfolioActiveTab = secondaryTabId
  console.log({ portfolioActiveTab })
  const {
    tokensPrices: { mvk: { usd: mvkExchangeRate = 0 } = {} },
  } = useSelector((state: State) => state.tokens)
  const {
    user: {
      userLoansData: { userBorrowing, userLendings },
    },
  } = useSelector((state: State) => state.wallet)

  const [toggleItems, setToggleItems] = useState<TabItem[]>(TOGGLE_VALUES)
  const lastSeria = CHART_TEST_DATA.at(-1)?.value ?? 0

  return (
    <>
      {/* TODO: make this chart dynamic need data in indexer for it */}
      <PortfolioChartStyled>
        <GovRightContainerTitleArea>
          <h2>MVK Earning History</h2>
        </GovRightContainerTitleArea>
        <div className="chart-periods">
          <SlidingTabButtons
            tabItems={toggleItems}
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
        <div className="last-seria">
          <div className="mvk">
            <CommaNumber endingText="MVK" value={lastSeria} />
          </div>
          <div className="usd">
            <CommaNumber beginningText="$" value={lastSeria * mvkExchangeRate} />
          </div>
        </div>
        <Chart
          data={CHART_TEST_DATA}
          settings={{
            height: 260,
          }}
          className="portfolio"
        />
      </PortfolioChartStyled>

      <PortfolioWalletStyled>
        <GovRightContainerTitleArea>
          <h2>Wallet</h2>
        </GovRightContainerTitleArea>
        <div className="wallet-info">
          <div className="name">Staked MVK</div>
          <div className="value">
            <CommaNumber value={sMVKAmount} />
            <Link to="/">
              <Button kind={BUTTON_SIMPLE}>View</Button>
            </Link>
          </div>
        </div>
        <div className="wallet-info">
          <div className="name">MVK Not Staked</div>
          <div className="value">
            <CommaNumber value={notsMVKAmount} />
            <Link to="/">
              <Button kind={BUTTON_SIMPLE}>Stake</Button>
            </Link>
          </div>
        </div>
        <div className="wallet-info">
          <div className="name">XTZ in Wallet</div>
          <div className="value">
            <CommaNumber value={xtzAmount} />
            <a href="https://mavryk.finance/bakery" target="_blank" rel="noreferrer">
              <Button kind={BUTTON_SIMPLE}>Delegate</Button>
            </a>
          </div>
        </div>
        <div className="wallet-info">
          <div className="name">tzBTC in Wallet</div>
          <div className="value">
            <CommaNumber value={tzBTCAmount} />
            <Link to="/loans">
              <Button kind={BUTTON_SIMPLE}>Borrow</Button>
            </Link>
          </div>
        </div>
      </PortfolioWalletStyled>

      <div className="tabs-switchers">
        <Link
          to={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_POSITION_TAB_ID}`}
          className={portfolioActiveTab === PORTFOLIO_POSITION_TAB_ID ? 'selected' : ''}
        >
          Lend/Borrow Position
        </Link>
        <Link
          to={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_LENDING_TAB_ID}`}
          className={portfolioActiveTab === PORTFOLIO_LENDING_TAB_ID ? 'selected' : ''}
        >
          Lending TXs
        </Link>
        <Link
          to={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_BORROWING_TAB_ID}`}
          className={portfolioActiveTab === PORTFOLIO_BORROWING_TAB_ID ? 'selected' : ''}
        >
          Borrow TXs
        </Link>
      </div>

      <Switch>
        <Route exact path={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_POSITION_TAB_ID}`}>
          <div>{PORTFOLIO_POSITION_TAB_ID}</div>
        </Route>
        <Route exact path={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_LENDING_TAB_ID}`}>
          <div>{PORTFOLIO_LENDING_TAB_ID}</div>
        </Route>
        <Route exact path={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_BORROWING_TAB_ID}`}>
          <div>{PORTFOLIO_BORROWING_TAB_ID}</div>
        </Route>

        <Redirect to={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_POSITION_TAB_ID}`} />
      </Switch>

      <LBHInfoBlock>
        <GovRightContainerTitleArea>
          <h2>My Lending</h2>
        </GovRightContainerTitleArea>
        {isUserLoansLoading ? (
          <div className="loader-wrapper">
            <ClockLoader />
          </div>
        ) : userLendings.length ? (
          <div className="list scroll-block">
            {userLendings.map(({ icon, amount, annualPecentage, earned, operationHash, id }) => {
              return (
                // TODO: temp solution while earn column is disabled
                // <ListItem columsTemplate="60px 0.9fr 0.7fr 0.8fr 0.7fr" key={id + operationHash}>
                <ListItem columsTemplate="60px 0.9fr 0.7fr 1.5fr" key={id + operationHash}>
                  <ImageWithPlug imageLink={icon} alt={`lended asset logo`} />
                  <div className="list-part">
                    <div className="name">Supplied</div>
                    <div className="value">
                      <CommaNumber value={amount} beginningText="$" />
                    </div>
                  </div>
                  <div className="list-part">
                    <div className="name">APY</div>
                    <div className="value">
                      <CommaNumber value={annualPecentage} endingText="%" />
                    </div>
                  </div>
                  {/* <div className="list-part">
                    <div className="name">Earned</div>
                    <div className="value">
                      <CommaNumber value={earned} />
                    </div>
                  </div> */}
                  <div className="list-part  view-tx-link">
                    <Link to={{ pathname: `https://ghostnet.tzkt.io/${operationHash}` }} target="_blank">
                      <Button kind={BUTTON_SIMPLE}>View TX</Button>
                    </Link>
                  </div>
                </ListItem>
              )
            })}
          </div>
        ) : (
          <div className="no-data">
            <span>Nothing supplied at this time</span>
            <div className="nav-button">
              <Link to="/loans">
                <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE}>
                  <Icon id="lend" />
                  Lend Asset{' '}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </LBHInfoBlock>
      <LBHInfoBlock>
        <GovRightContainerTitleArea>
          <h2>My Borrowing</h2>
        </GovRightContainerTitleArea>
        {isUserLoansLoading ? (
          <div className="loader-wrapper">
            <ClockLoader />
          </div>
        ) : userBorrowing.length ? (
          <div className="list scroll-block">
            {userBorrowing.map(({ icon, amount, annualPecentage, earned, operationHash, id }) => {
              return (
                // TODO: temp solution while earn column is disabled
                // <ListItem columsTemplate="60px 0.9fr 0.7fr 0.8fr 0.7fr" key={id + operationHash}>
                <ListItem columsTemplate="60px 0.9fr 0.7fr 1.5fr" key={id + operationHash}>
                  <ImageWithPlug imageLink={icon} alt={`borrowed asset logo`} />
                  <div className="list-part">
                    <div className="name">Borrowed</div>
                    <div className="value">
                      <CommaNumber value={amount} beginningText="$" />
                    </div>
                  </div>
                  <div className="list-part">
                    <div className="name">APR</div>
                    <div className="value">
                      <CommaNumber value={annualPecentage} endingText="%" />
                    </div>
                  </div>
                  {/* <div className="list-part">
                    <div className="name">Earned</div>
                    <div className="value">
                      <CommaNumber value={earned} />
                    </div>
                  </div> */}
                  <div className="list-part view-tx-link">
                    <Link to={{ pathname: `https://ghostnet.tzkt.io/${operationHash}` }} target="_blank">
                      <Button kind={BUTTON_SIMPLE}>View TX</Button>
                    </Link>
                  </div>
                </ListItem>
              )
            })}
          </div>
        ) : (
          <div className="no-data">
            <span>Nothing borrowed at this time</span>
            <div className="nav-button">
              <Link to="/loans">
                <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE}>
                  <Icon id="borrow" />
                  Borrow Asset{' '}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </LBHInfoBlock>
    </>
  )
}

export default PortfolioTab

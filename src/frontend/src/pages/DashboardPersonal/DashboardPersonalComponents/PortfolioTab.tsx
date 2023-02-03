import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { State } from 'reducers'

import { CHART_TEST_DATA } from '../tabs.const'
import { ACTION_PRIMARY, ACTION_SIMPLE, TRANSPARENT } from 'app/App.components/Button/Button.constants'

import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Chart } from 'app/App.components/Chart/Chart.view'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { SlidingTabButtons, TabItem } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import Icon from 'app/App.components/Icon/Icon.view'

import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import {
  DashboardPersonalTabStyled,
  LBHInfoBlock,
  ListItem,
  PortfolioWalletStyled,
  PortfolioChartStyled,
} from './DashboardPersonalComponents.style'

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
  const { exchangeRate } = useSelector((state: State) => state.mvkToken)
  const {
    user: {
      userLoansData: { userBorrowing, userLendings },
    },
  } = useSelector((state: State) => state.wallet)

  const [toggleItems, setToggleItems] = useState<TabItem[]>(TOGGLE_VALUES)
  const lastSeria = CHART_TEST_DATA.at(-1)?.value ?? 0

  return (
    <DashboardPersonalTabStyled>
      <PortfolioChartStyled>
        <GovRightContainerTitleArea>
          <h2>MVK Earning History</h2>
        </GovRightContainerTitleArea>
        <div className="chart-periods">
          <SlidingTabButtons
            tabItems={toggleItems}
            onClick={(tabId) =>
              setToggleItems(
                toggleItems.map((item) =>
                  item.id === tabId
                    ? {
                        ...item,
                        active: true,
                      }
                    : {
                        ...item,
                        active: false,
                      },
                ),
              )
            }
          />
        </div>
        <div className="last-seria">
          <div className="mvk">
            <CommaNumber endingText="MVK" value={lastSeria} />
          </div>
          <div className="usd">
            <CommaNumber beginningText="$" value={lastSeria * exchangeRate} />
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
              <Button text="View" className="no-before" kind={ACTION_SIMPLE} />
            </Link>
          </div>
        </div>
        <div className="wallet-info">
          <div className="name">MVK Not Staked</div>
          <div className="value">
            <CommaNumber value={notsMVKAmount} />
            <Link to="/">
              <Button text="Stake" className="no-before" kind={ACTION_SIMPLE} />
            </Link>
          </div>
        </div>
        <div className="wallet-info">
          <div className="name">XTZ in Wallet</div>
          <div className="value">
            <CommaNumber value={xtzAmount} />
            <Link to="/satellites">
              <Button text="Delegate" className="no-before" kind={ACTION_SIMPLE} />
            </Link>
          </div>
        </div>
        <div className="wallet-info">
          <div className="name">tzBTC in Wallet</div>
          <div className="value">
            <CommaNumber value={tzBTCAmount} />
            <Link to="/loans">
              <Button text="Borrow" className="no-before" kind={ACTION_SIMPLE} />
            </Link>
          </div>
        </div>
      </PortfolioWalletStyled>

      <LBHInfoBlock>
        <GovRightContainerTitleArea>
          <h2>Lending</h2>
        </GovRightContainerTitleArea>
        {isUserLoansLoading ? (
          <div className="loader-wrapper">
            <ClockLoader />
          </div>
        ) : userLendings.length ? (
          <div className="list scroll-block">
            {userLendings.map(({ icon, amount, annualPecentage, earned, operationHash, id }) => {
              return (
                <ListItem columsTemplate="60px 0.9fr 0.7fr 0.8fr 0.7fr" key={id + operationHash}>
                  {icon ? (
                    <div className="image-wrapper">
                      <img src={icon} alt="" />
                    </div>
                  ) : (
                    <Icon id={'noImage'} />
                  )}
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
                  <div className="list-part">
                    <div className="name">Earned</div>
                    <div className="value">
                      <CommaNumber value={earned} />
                    </div>
                  </div>
                  <div className="list-part  view-tx-link">
                    <Link to={{ pathname: `https://ghostnet.tzkt.io/${operationHash}` }} target="_blank">
                      <Button text="View TX" kind={TRANSPARENT} className="link" />
                    </Link>
                  </div>
                </ListItem>
              )
            })}
          </div>
        ) : (
          <div className="no-data">
            <span>Nothing supplied at this time</span>
            <Link to="/loans">
              <Button text="Lend Asset" icon="lend" kind={ACTION_PRIMARY} className="noStroke dashboard-sectionLink" />
            </Link>
          </div>
        )}
      </LBHInfoBlock>
      <LBHInfoBlock>
        <GovRightContainerTitleArea>
          <h2>Borrowing</h2>
        </GovRightContainerTitleArea>
        {isUserLoansLoading ? (
          <div className="loader-wrapper">
            <ClockLoader />
          </div>
        ) : userBorrowing.length ? (
          <div className="list scroll-block">
            {userBorrowing.map(({ icon, amount, annualPecentage, earned, operationHash, id }) => {
              return (
                <ListItem columsTemplate="60px 0.9fr 0.7fr 0.8fr 0.7fr" key={id + operationHash}>
                  {icon ? (
                    <div className="image-wrapper">
                      <img src={icon} alt="" />
                    </div>
                  ) : (
                    <Icon id={'noImage'} />
                  )}

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
                  <div className="list-part">
                    <div className="name">Earned</div>
                    <div className="value">
                      <CommaNumber value={earned} />
                    </div>
                  </div>
                  <div className="list-part view-tx-link">
                    <Link to={{ pathname: `https://ghostnet.tzkt.io/${operationHash}` }} target="_blank">
                      <Button text="View TX" kind={TRANSPARENT} className="link" />
                    </Link>
                  </div>
                </ListItem>
              )
            })}
          </div>
        ) : (
          <div className="no-data">
            <span>Nothing borrowed at this time</span>
            <Link to="/loans">
              <Button
                text="Borrow Asset"
                icon="borrow"
                kind={ACTION_PRIMARY}
                className="noStroke dashboard-sectionLink"
              />
            </Link>
          </div>
        )}
      </LBHInfoBlock>
    </DashboardPersonalTabStyled>
  )
}

export default PortfolioTab

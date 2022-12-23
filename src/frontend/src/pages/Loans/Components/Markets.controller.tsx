import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

// const
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { CHART_TEST_DATA } from 'pages/DashboardPersonal/tabs.const'
import { BORROW_TAB_ID, LEND_TAB_ID } from '../Loans.const'

// view
import { Button } from 'app/App.components/Button/Button.controller'
import { Chart } from 'app/App.components/Chart/Chart.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'

// styles
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { skyColor } from 'styles'
import {
  LoansStyled,
  MarketChartsContainer,
  MarketOverview,
  MarketsOverviewContainer,
  ThreeLevelListItem,
} from '../Loans.style'

// types
import { State } from 'reducers'

export const Markets = () => {
  const { loanAssets, chartsData } = useSelector((state: State) => state.loans)

  return (
    <LoansStyled>
      <MarketChartsContainer>
        <div className="chart-wrapper">
          <div className="summary">
            <span>Total Lended:</span>
            <CommaNumber value={chartsData.totalLended} beginningText={'$'} />
          </div>
          <Chart
            data={chartsData.lendingChartData}
            colors={{
              lineColor: skyColor,
              areaTopColor: skyColor,
              areaBottomColor: 'rgba(119, 164, 242, 0)',
              textColor: '#CDCDCD',
            }}
            className="loan-chart"
            settings={{
              width: 372,
              height: 182,
              hideXAxis: true,
              hideYAxis: true,
            }}
          />
        </div>
        <div className="chart-wrapper">
          <div className="summary">
            <span>Total Borrowed:</span>
            <CommaNumber value={chartsData.totalBorrowed} beginningText={'$'} />
          </div>
          <Chart
            data={chartsData.borrowingChartData}
            colors={{
              lineColor: skyColor,
              areaTopColor: skyColor,
              areaBottomColor: 'rgba(119, 164, 242, 0)',
              textColor: '#CDCDCD',
            }}
            className="loan-chart"
            settings={{
              width: 372,
              height: 182,
              hideXAxis: true,
              hideYAxis: true,
            }}
          />
        </div>
      </MarketChartsContainer>
      <MarketsOverviewContainer>
        <GovRightContainerTitleArea>
          <h2>Markets</h2>
        </GovRightContainerTitleArea>
        {loanAssets.map((loanAsset) => {
          return (
            <MarketOverview>
              <div className="asset-info">
                <Icon id={'xtzTezos'} />
                <div className="name">{loanAsset}</div>
                <div className="rate">
                  <CommaNumber beginningText="$" value={1.342} />
                </div>
              </div>

              <div className="content-wrapper">
                <div className="row">
                  <ThreeLevelListItem>
                    <div className="name">Total Lending</div>
                    <CommaNumber value={12414.2423} className="value" showLetter />
                    <CommaNumber value={12414.2423} beginningText="$" className="rate" showLetter />
                  </ThreeLevelListItem>
                  <ThreeLevelListItem>
                    <div className="name">Lend APY</div>
                    <CommaNumber value={22} className="value" endingText="%" showLetter />
                  </ThreeLevelListItem>
                  <ThreeLevelListItem>
                    <div className="name">Total Fees Earned</div>
                    <CommaNumber value={12414.2423} className="value" beginningText="$" showLetter />
                  </ThreeLevelListItem>
                  <ThreeLevelListItem>
                    <div className="name">Suppliers</div>
                    <CommaNumber value={12414.2423} className="value" showLetter />
                  </ThreeLevelListItem>
                  <ThreeLevelListItem>
                    <div className="name">Utilization Rate</div>
                    <CommaNumber value={12414.2423} className="value" endingText="%" showLetter />
                  </ThreeLevelListItem>
                  <Link to={`/market/${loanAsset}/${LEND_TAB_ID}`}>
                    <Button text="Lend" kind={ACTION_PRIMARY} iconAfter icon="arrowRight" />
                  </Link>
                </div>
                <div className="row">
                  <ThreeLevelListItem>
                    <div className="name">Total Borrowed</div>
                    <CommaNumber value={12414.2423} className="value" showLetter />
                    <CommaNumber value={12414.2423} beginningText="$" showLetter className="rate" />
                  </ThreeLevelListItem>
                  <ThreeLevelListItem>
                    <div className="name">Borrow APR</div>
                    <CommaNumber value={22} className="value" showLetter endingText="%" />
                  </ThreeLevelListItem>
                  <ThreeLevelListItem>
                    <div className="name">Available Liquidity</div>
                    <CommaNumber value={12414.2423} className="value" showLetter beginningText="$" />
                  </ThreeLevelListItem>
                  <ThreeLevelListItem>
                    <div className="name">Borrowers</div>
                    <CommaNumber value={12414.2423} className="value" showLetter />
                  </ThreeLevelListItem>
                  <ThreeLevelListItem>
                    <div className="name">Total Collateral</div>
                    <CommaNumber
                      value={12414.2423}
                      showLetter
                      className={`value ${true ? 'up' : 'down'}`}
                      beginningText="$"
                    />
                  </ThreeLevelListItem>
                  <Link to={`/market/${loanAsset}/${BORROW_TAB_ID}`}>
                    <Button text="Borrow" kind={ACTION_PRIMARY} iconAfter icon="arrowRight" />
                  </Link>
                </div>
              </div>
            </MarketOverview>
          )
        })}
      </MarketsOverviewContainer>
    </LoansStyled>
  )
}

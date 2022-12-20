import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { Chart } from 'app/App.components/Chart/Chart.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { CHART_TEST_DATA } from 'pages/DashboardPersonal/tabs.const'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { State } from 'reducers'
import { skyColor } from 'styles'
import { LoansStyled, MarketChartsContainer, MarketOverview, MarketsOverviewContainer } from '../Loans.style'

export const Markets = () => {
  const { wallet, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { loanAssets } = useSelector((state: State) => state.loans)

  return (
    <LoansStyled>
      <MarketChartsContainer>
        <div className="chart-wrapper">
          <div className="summary">
            <span>Total Lended:</span>
            <CommaNumber value={109041.24} beginningText={'$'} />
          </div>
          <Chart
            data={CHART_TEST_DATA}
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
            <CommaNumber value={109041.24} beginningText={'$'} />
          </div>
          <Chart
            data={CHART_TEST_DATA}
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
                  <div className="row-item">
                    <div className="name">Total Lending</div>
                    <CommaNumber value={12414.2423} className="value" />
                    <CommaNumber value={12414.2423} beginningText="$" className="rate" />
                  </div>
                  <div className="row-item">
                    <div className="name">Lend APY</div>
                    <CommaNumber value={22} className="value" endingText="%" />
                  </div>
                  <div className="row-item">
                    <div className="name">Total Fees Earned</div>
                    <CommaNumber value={12414.2423} className="value" beginningText="$" />
                  </div>
                  <div className="row-item">
                    <div className="name">Suppliers</div>
                    <CommaNumber value={12414.2423} className="value" />
                  </div>
                  <div className="row-item">
                    <div className="name">Utilization Rate</div>
                    <CommaNumber value={12414.2423} className="value" endingText="%" />
                  </div>
                  <Link to={`/market/${loanAsset}/lendingTab`}>
                    <Button text="Lend" kind={ACTION_PRIMARY} iconAfter icon="arrowRight" />
                  </Link>
                </div>
                <div className="row">
                  <div className="row-item">
                    <div className="name">Total Borrowed</div>
                    <CommaNumber value={12414.2423} className="value" />
                    <CommaNumber value={12414.2423} beginningText="$" className="rate" />
                  </div>
                  <div className="row-item">
                    <div className="name">Borrow APR</div>
                    <CommaNumber value={22} className="value" endingText="%" />
                  </div>
                  <div className="row-item">
                    <div className="name">Available Liquidity</div>
                    <CommaNumber value={12414.2423} className="value" beginningText="$" />
                  </div>
                  <div className="row-item">
                    <div className="name">Borrowers</div>
                    <CommaNumber value={12414.2423} className="value" />
                  </div>
                  <div className="row-item">
                    <div className="name">Total Collateral</div>
                    <CommaNumber value={12414.2423} className={`value ${true ? 'up' : 'down'}`} beginningText="$" />
                  </div>
                  <Link to={`/market/${loanAsset}/borrowTab`}>
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

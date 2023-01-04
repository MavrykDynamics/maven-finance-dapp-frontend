import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

// const
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { BORROW_TAB_ID, LEND_TAB_ID } from './Loans.const'

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
} from './Loans.style'

// types
import { State } from 'reducers'
import { EmptyContainer } from 'app/App.style'

export const Markets = () => {
  const { loanTokens, chartsData } = useSelector((state: State) => state.loans)

  // TODO: add loader to the page, if data is not loaded, need to create dataLoaderHook

  const lendingPart = (
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
  )

  const borrowingPart = (
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
  )

  return (
    <LoansStyled>
      <MarketChartsContainer>
        {lendingPart}
        {borrowingPart}
      </MarketChartsContainer>

      {loanTokens.length ? (
        <MarketsOverviewContainer>
          <GovRightContainerTitleArea>
            <h2>Markets</h2>
          </GovRightContainerTitleArea>
          {loanTokens.map((loanAsset) => {
            const {
              loanTokenData: { name, symbol, icon, rate },
              utilisationRate,
              avaliableLiquidity,
              borrowers,
              collateral,
              vaultsBorrowedAmount,
              totalBorrowed,
              suppliers,
              totalLended,
            } = loanAsset

            const totalCorratealColor = collateral / vaultsBorrowedAmount > 2 ? 'up' : 'down'
            return (
              <MarketOverview key={name}>
                <div className="asset-info">
                  {icon ? (
                    <div className="icon">
                      <img src={icon} alt={`${symbol} logo`} />
                    </div>
                  ) : (
                    <Icon id={'noIcon'} />
                  )}
                  <div className="name">{name}</div>
                  {rate ? (
                    <div className="rate">
                      <CommaNumber beginningText="$" value={rate} />{' '}
                    </div>
                  ) : null}
                </div>

                <div className="content-wrapper">
                  <div className="row">
                    <ThreeLevelListItem>
                      <div className="name">Total Lending</div>
                      <CommaNumber value={totalLended} className="value" showLetter />
                      {rate ? (
                        <CommaNumber value={totalLended * rate} beginningText="$" className="rate" showLetter />
                      ) : null}
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
                      <CommaNumber value={suppliers} className="value" showLetter />
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Utilization Rate</div>
                      <CommaNumber value={utilisationRate} className="value" endingText="%" showLetter />
                    </ThreeLevelListItem>
                    <Link to={`/loans/${symbol}/${LEND_TAB_ID}`}>
                      <Button text="Lend" kind={ACTION_PRIMARY} iconAfter icon="arrowRight" />
                    </Link>
                  </div>
                  <div className="row">
                    <ThreeLevelListItem>
                      <div className="name">Total Borrowed</div>
                      <CommaNumber value={totalBorrowed} className="value" showLetter />
                      {rate ? (
                        <CommaNumber value={totalBorrowed * rate} beginningText="$" showLetter className="rate" />
                      ) : null}
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Borrow APR</div>
                      <CommaNumber value={22} className="value" showLetter endingText="%" />
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Available Liquidity</div>
                      <CommaNumber value={avaliableLiquidity} className="value" showLetter beginningText="$" />
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Borrowers</div>
                      <CommaNumber value={borrowers} className="value" showLetter />
                    </ThreeLevelListItem>
                    <ThreeLevelListItem>
                      <div className="name">Total Collateral</div>
                      <CommaNumber
                        value={collateral}
                        showLetter
                        className={`value ${totalCorratealColor}`}
                        beginningText="$"
                      />
                    </ThreeLevelListItem>
                    <Link to={`/loans/${symbol}/${BORROW_TAB_ID}`}>
                      <Button text="Borrow" kind={ACTION_PRIMARY} iconAfter icon="arrowRight" />
                    </Link>
                  </div>
                </div>
              </MarketOverview>
            )
          })}
        </MarketsOverviewContainer>
      ) : (
        <EmptyContainer
          style={{
            paddingTop: '80px',
          }}
        >
          <img src="/images/not-found.svg" alt=" No active markets to show" />
          <figcaption> No active markets to show</figcaption>
        </EmptyContainer>
      )}
    </LoansStyled>
  )
}

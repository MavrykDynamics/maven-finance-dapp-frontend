import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Button } from 'app/App.components/Button/Button.controller'
import { Chart } from 'app/App.components/Chart/Chart.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'

import { getLoansStorage } from './Loans.actions'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { BORROW_TAB_ID, LEND_TAB_ID } from './Loans.const'

import { State } from 'reducers'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'

import { Page } from 'styles'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { skyColor } from 'styles'
import {
  LoansStyled,
  MarketChartsContainer,
  MarketOverview,
  MarketsOverviewContainer,
  ThreeLevelListItem,
} from './Loans.style'
import { EmptyContainer } from 'app/App.style'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

export const Loans = () => {
  const dispatch = useDispatch()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { isFetched } = useSelector((state: State) => state.loans)

  const { isLoading } = useDataLoader(async () => {
    try {
      if (!isFetched) {
        await dispatch(getLoansStorage())
      }
    } catch (e) {}
  }, [accountPkh])
  const { loanTokens, chartsData } = useSelector((state: State) => state.loans)

  const lendingPart = (
    <div className="chart-wrapper">
      <div className="summary">
        <span>Total Lending</span>
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
        numberOfItemsToDisplay={3}
      >
        <div className="chart-interval">7 Days</div>
      </Chart>
    </div>
  )

  const borrowingPart = (
    <div className="chart-wrapper">
      <div className="summary">
        <span>Total Borrowing</span>
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
        numberOfItemsToDisplay={3}
      >
        <div className="chart-interval">7 Days</div>
      </Chart>
    </div>
  )

  return (
    <Page>
      <PageHeader page={'lending'} />
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
                availableLiquidity,
                borrowers,
                loanTokenTotalCollaterals,
                loanTokenVaultsTotalBorrowed,
                totalBorrowed,
                suppliers,
                totalLended,
                borrowAPR,
                totalFeesEarned,
                lendingAPY,
              } = loanAsset

              const totalCorratealColor = loanTokenTotalCollaterals / loanTokenVaultsTotalBorrowed > 2 ? 'up' : 'down'
              return (
                <MarketOverview key={`${name}-${symbol}`}>
                  <div className="asset-info">
                    {icon ? (
                      <div className="icon">
                        <img src={icon} alt={`${symbol} logo`} />
                      </div>
                    ) : (
                      <Icon id={'noImage'} />
                    )}
                    <div className="name">{name}</div>
                    {rate ? (
                      <div className="rate">
                        <CommaNumber beginningText="$" value={rate} />
                      </div>
                    ) : null}
                  </div>

                  <div className="content-wrapper">
                    <div className="row">
                      <ThreeLevelListItem>
                        <div className="name">Total Lending</div>
                        <CommaNumber value={totalLended} className="value" />
                        {rate ? <CommaNumber value={totalLended * rate} beginningText="$" className="rate" /> : null}
                      </ThreeLevelListItem>
                      <ThreeLevelListItem>
                        <div className="name">Lend APY</div>
                        <div className="value">
                          <CommaNumber value={lendingAPY} className="value" endingText="%" />{' '}
                          <CustomTooltip
                            iconId="info"
                            defaultStrokeColor={skyColor}
                            text="wgsgfdgdfg"
                            className="tooltip"
                          />
                        </div>
                      </ThreeLevelListItem>
                      <ThreeLevelListItem>
                        <div className="name">Total Fees Earned</div>
                        <CommaNumber value={totalFeesEarned} className="value" beginningText="$" />
                      </ThreeLevelListItem>
                      <ThreeLevelListItem>
                        <div className="name">Suppliers</div>
                        <CommaNumber value={suppliers} className="value" />
                      </ThreeLevelListItem>
                      <ThreeLevelListItem>
                        <div className="name">Utilization Rate</div>
                        <CommaNumber value={utilisationRate} className="value" endingText="%" />
                      </ThreeLevelListItem>
                      <Link to={`/loans/${symbol}/${LEND_TAB_ID}`} className={`${accountPkh ? '' : 'disabled-link'}`}>
                        <Button
                          text="Lend"
                          kind={ACTION_PRIMARY}
                          iconAfter
                          disabled={Boolean(!accountPkh)}
                          icon="arrowRight"
                        />
                      </Link>
                    </div>
                    <div className="row">
                      <ThreeLevelListItem>
                        <div className="name">Total Borrowed</div>
                        <CommaNumber value={totalBorrowed} className="value" />
                        {rate ? <CommaNumber value={totalBorrowed * rate} beginningText="$" className="rate" /> : null}
                      </ThreeLevelListItem>
                      <ThreeLevelListItem>
                        <div className="name">Borrow APR</div>
                        <div className="value">
                          <CommaNumber value={borrowAPR} className="value" endingText="%" />{' '}
                          <CustomTooltip
                            iconId="info"
                            defaultStrokeColor={skyColor}
                            text="wgsgfdgdfg"
                            className="tooltip"
                          />
                        </div>
                      </ThreeLevelListItem>
                      <ThreeLevelListItem>
                        <div className="name">Available Liquidity</div>
                        <CommaNumber value={availableLiquidity} className="value" beginningText="$" />
                      </ThreeLevelListItem>
                      <ThreeLevelListItem>
                        <div className="name">Borrowers</div>
                        <CommaNumber value={borrowers} className="value" />
                      </ThreeLevelListItem>
                      <ThreeLevelListItem>
                        <div className="name">Total Collateral</div>
                        <CommaNumber
                          value={loanTokenTotalCollaterals}
                          className={`value ${totalCorratealColor}`}
                          beginningText="$"
                        />
                      </ThreeLevelListItem>
                      <Link to={`/loans/${symbol}/${BORROW_TAB_ID}`} className={`${accountPkh ? '' : 'disabled-link'}`}>
                        <Button
                          text="Borrow"
                          kind={ACTION_PRIMARY}
                          disabled={Boolean(!accountPkh)}
                          iconAfter
                          icon="arrowRight"
                        />
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
    </Page>
  )
}

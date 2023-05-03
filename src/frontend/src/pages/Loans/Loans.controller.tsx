import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Button } from 'app/App.components/Button/Button.controller'
import { Chart } from 'app/App.components/Chart/Chart'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'

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
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { getLoansStorage } from './Actions/getLoansData.actions'
import { useEffect, useMemo } from 'react'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import colors from 'styles/colors'
import { AREA_CHART_TYPE } from 'app/App.components/Chart/helpers/Chart.types'
import { CURRENCY_AMOUNT_DATE_TOOLTIP } from 'app/App.components/Chart/Tooltips/ChartTooltip'

const CHART_SETTINGS = {
  width: 450,
  height: 270,
  hideXAxis: true,
  hideYAxis: true,
}

const CHART_COLORS = {
  lineColor: skyColor,
  areaTopColor: skyColor,
  areaBottomColor: 'rgba(119, 164, 242, 0)',
  textColor: '#CDCDCD',
}

export const Loans = () => {
  const dispatch = useDispatch()
  const { isDataLoaded, loanTokens, chartsData } = useSelector((state: State) => state.loans)
  const { themeSelected } = useSelector((state: State) => state.preferences)
  const { accountPkh } = useSelector((state: State) => state.wallet)

  const { totalBorrowed, totalLended } = loanTokens.reduce<{
    totalLended: number
    totalBorrowed: number
  }>(
    (acc, { totalBorrowed, totalLended, loanTokenData: { rate } }) => {
      acc.totalBorrowed += totalBorrowed * rate
      acc.totalLended += totalLended * rate
      return acc
    },
    {
      totalLended: 0,
      totalBorrowed: 0,
    },
  )

  const { isLoading } = useDataLoader(
    async (isDepsChanged) => {
      try {
        if (!isDataLoaded || isDepsChanged) {
          await dispatch(getLoansStorage())
        }
      } catch (e) {}
    },
    [accountPkh],
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const lendingPart = (
    <div className="chart-wrapper">
      <div className="summary">
        <span>Total Lending</span>
        <CommaNumber value={totalLended} beginningText={'$'} />
      </div>
      <div className="chart">
        <Chart
          data={{ type: AREA_CHART_TYPE, plots: chartsData.lendingChartData }}
          colors={CHART_COLORS}
          settings={CHART_SETTINGS}
          numberOfItemsToDisplay={3}
          tooltipName={CURRENCY_AMOUNT_DATE_TOOLTIP}
          tooltipAsset="$"
        />
        <div className="chart-interval">7 Days</div>
      </div>
    </div>
  )

  const borrowingPart = (
    <div className="chart-wrapper">
      <div className="summary">
        <span>Total Borrowing</span>
        <CommaNumber value={totalBorrowed} beginningText={'$'} />
      </div>
      <div className="chart">
        <Chart
          data={{ type: AREA_CHART_TYPE, plots: chartsData.borrowingChartData }}
          colors={CHART_COLORS}
          settings={CHART_SETTINGS}
          numberOfItemsToDisplay={3}
          tooltipName={CURRENCY_AMOUNT_DATE_TOOLTIP}
          tooltipAsset="$"
        />
        <div className="chart-interval">7 Days</div>
      </div>
    </div>
  )

  return (
    <Page>
      <PageHeader page={'lending'} />

      {isLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading loans markets</div>
        </DataLoaderWrapper>
      ) : loanTokens.length ? (
        <LoansStyled>
          <MarketChartsContainer>
            {lendingPart}
            {borrowingPart}
          </MarketChartsContainer>

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

              const totalCorratealColor =
                loanTokenTotalCollaterals && loanTokenVaultsTotalBorrowed
                  ? loanTokenTotalCollaterals / loanTokenVaultsTotalBorrowed > 2
                    ? 'up'
                    : 'down'
                  : 'neutral'
              return (
                <MarketOverview key={`${name}-${symbol}`}>
                  <div className="asset-info">
                    <ImageWithPlug imageLink={icon} alt={`${symbol} logo`} />
                    <div className="name">{symbol}</div>
                    {rate ? (
                      <div className="rate">
                        <CommaNumber beginningText="$" value={rate} decimalsToShow={4} showDecimal />
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
                            defaultStrokeColor={colors[themeSelected].dataColor}
                            text="Current yield suppliers are earning on their deposits."
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
                      <Link to={`/loans/${symbol}/${LEND_TAB_ID}`}>
                        <Button text="Lend" kind={ACTION_PRIMARY} iconAfter icon="arrowRight" />
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
                            defaultStrokeColor={colors[themeSelected].dataColor}
                            text="Current interest rate being charged to borrowers."
                            className="tooltip"
                          />
                        </div>
                      </ThreeLevelListItem>
                      <ThreeLevelListItem>
                        <div className="name">Available Liquidity</div>
                        <CommaNumber value={availableLiquidity * rate} className="value" beginningText="$" />
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
                      <Link to={`/loans/${symbol}/${BORROW_TAB_ID}`}>
                        <Button text="Borrow" kind={ACTION_PRIMARY} iconAfter icon="arrowRight" />
                      </Link>
                    </div>
                  </div>
                </MarketOverview>
              )
            })}
          </MarketsOverviewContainer>
        </LoansStyled>
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
    </Page>
  )
}

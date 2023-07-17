import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import classNames from 'classnames'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Button } from 'app/App.components/Button/Button.controller'
import { Chart } from 'app/App.components/Chart/Chart'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'

import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { DEFAULT_LOANS_ACTIVE_SUBS, LOANS_MARKETS_DATA } from 'providers/LoansProvider/helpers/loans.const'
import { BORROW_TAB_ID, LEND_TAB_ID } from './Loans.const'
import colors from 'styles/colors'
import { Page, skyColor } from 'styles'
import { CURRENCY_AMOUNT_DATE_TOOLTIP } from 'app/App.components/Chart/Tooltips/ChartTooltip'
import { AREA_CHART_TYPE } from 'app/App.components/Chart/helpers/Chart.types'
import { getChartDataBasedOnLength, getChartSettingsBasedOnChartLength } from './Loans.helpers'

import {
  LoansStyled,
  MarketChartsContainer,
  MarketOverview,
  MarketsOverviewContainer,
  ThreeLevelListItem,
} from './Loans.style'
import { EmptyContainer } from 'app/App.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import useLoansCharts from 'providers/LoansProvider/hooks/useLoansCharts'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'

// providers
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'
import { DEFAULT_VAULTS_ACTIVE_SUBS, VAULTS_ALL, VAULTS_DATA } from 'providers/VaultsProvider/vaults.provider.consts'

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
  const {
    isLoading: isChartsLoading,
    chartsData: { totalLendingChart, totalBorrowingChart },
  } = useLoansCharts({
    calcTotalBorrowingChart: true,
    calcTotalLendingChart: true,
  })

  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { userMTokens } = useUserContext()
  const { changeLoansSubscriptionsList, marketsAddresses, marketsMapper, isLoading: isLoansLoading } = useLoansContext()
  const { changeVaultsSubscriptionsList, vaultsMapper, allVaultsIds, isLoading: isVaultsLoading } = useVaultsContext()

  useEffect(() => {
    changeLoansSubscriptionsList({
      [LOANS_MARKETS_DATA]: true,
    })
    changeVaultsSubscriptionsList({
      [VAULTS_DATA]: VAULTS_ALL,
    })

    return () => {
      changeLoansSubscriptionsList(DEFAULT_LOANS_ACTIVE_SUBS)
      changeVaultsSubscriptionsList(DEFAULT_VAULTS_ACTIVE_SUBS)
    }
  }, [])

  const {
    preferences: { themeSelected },
  } = useDappConfigContext()

  const { totalBorrowed, totalLended } = marketsAddresses.reduce<{
    totalLended: number
    totalBorrowed: number
  }>(
    (acc, marketTokenAddress) => {
      const market = marketsMapper[marketTokenAddress]
      const loanToken = getTokenDataByAddress({ tokenAddress: marketTokenAddress, tokensPrices, tokensMetadata })

      if (!loanToken || !loanToken.rate || !market) return acc

      const { totalBorrowed, totalLended } = market
      const { decimals, rate } = loanToken

      acc.totalBorrowed += convertNumberForClient({ number: totalBorrowed, grade: decimals }) * rate
      acc.totalLended += convertNumberForClient({ number: totalLended, grade: decimals }) * rate
      return acc
    },
    {
      totalLended: 0,
      totalBorrowed: 0,
    },
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const lendingPart = (
    <div className="chart-wrapper">
      <div className="summary">
        <span>Total Earning</span>
        <CommaNumber value={totalLended} beginningText={'$'} />
      </div>
      <div className={classNames('chart', { emptyChart: totalLendingChart.length === 0 })}>
        <Chart
          data={{ type: AREA_CHART_TYPE, plots: getChartDataBasedOnLength(totalLendingChart, 7) }}
          colors={CHART_COLORS}
          settings={getChartSettingsBasedOnChartLength(totalLendingChart, CHART_SETTINGS)}
          numberOfItemsToDisplay={0}
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
      <div className={classNames('chart', { emptyChart: totalBorrowingChart.length === 0 })}>
        <Chart
          data={{ type: AREA_CHART_TYPE, plots: getChartDataBasedOnLength(totalBorrowingChart, 7) }}
          colors={CHART_COLORS}
          settings={getChartSettingsBasedOnChartLength(totalBorrowingChart, CHART_SETTINGS)}
          numberOfItemsToDisplay={0}
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

      {isLoansLoading || isVaultsLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading loans markets</div>
        </DataLoaderWrapper>
      ) : marketsAddresses.length ? (
        <LoansStyled>
          <MarketChartsContainer>
            {lendingPart}
            {borrowingPart}
          </MarketChartsContainer>

          <MarketsOverviewContainer>
            <H2Title>Markets</H2Title>
            {marketsAddresses.map((marketAddress) => {
              const market = marketsMapper[marketAddress]
              const loanToken = getTokenDataByAddress({ tokenAddress: marketAddress, tokensPrices, tokensMetadata })

              if (!loanToken || !loanToken.rate || !market) return null
              const {
                loanTokenAddress,
                loanMTokenAddress,
                utilisationRate,
                availableLiquidity,
                borrowers,
                totalBorrowed,
                suppliers,
                totalLended,
                borrowAPR,
                lendingAPY,
              } = market

              const { interestEarned } = userMTokens[loanMTokenAddress] ?? {
                interestEarned: 0,
              }

              const { symbol, decimals, icon, rate, address } = loanToken

              const { loanTokenTotalCollaterals, loanTokenVaultsTotalBorrowed } = allVaultsIds.reduce<{
                loanTokenTotalCollaterals: number
                loanTokenVaultsTotalBorrowed: number
              }>(
                (acc, vaultId) => {
                  const vault = vaultsMapper[vaultId]

                  if (vault.borrowedTokenAddress !== loanTokenAddress) return acc

                  acc.loanTokenTotalCollaterals += vault.collateralData.reduce(
                    (acc, { amount, tokenAddress: collateralTokenAddress }) => {
                      const collateralToken = getTokenDataByAddress({
                        tokenAddress: collateralTokenAddress,
                        tokensPrices,
                        tokensMetadata,
                      })

                      if (!collateralToken || !collateralToken.rate) return acc
                      const { decimals, rate } = collateralToken
                      return (acc += convertNumberForClient({ number: amount, grade: decimals }) * rate)
                    },
                    0,
                  )

                  acc.loanTokenVaultsTotalBorrowed +=
                    convertNumberForClient({ number: vault.borrowedAmount, grade: decimals }) * rate
                  return acc
                },
                {
                  loanTokenTotalCollaterals: 0,
                  loanTokenVaultsTotalBorrowed: 0,
                },
              )

              const convertedMarketTotalLended = convertNumberForClient({ number: totalLended, grade: decimals })
              const convertedMarketTotalBorrowed = convertNumberForClient({ number: totalBorrowed, grade: decimals })

              const totalCorratealColor =
                loanTokenTotalCollaterals && loanTokenVaultsTotalBorrowed
                  ? loanTokenTotalCollaterals / loanTokenVaultsTotalBorrowed > 2
                    ? 'up'
                    : 'down'
                  : 'neutral'
              return (
                <MarketOverview key={symbol}>
                  <div className="asset-info">
                    <ImageWithPlug imageLink={icon} alt={`${symbol} logo`} />
                    <div className="name">{symbol}</div>
                    <div className="rate">
                      <CommaNumber beginningText="$" value={rate} decimalsToShow={4} showDecimal />
                    </div>
                  </div>

                  <div className="content-wrapper">
                    <div className="row">
                      <ThreeLevelListItem>
                        <div className="name">Total Earning</div>
                        <CommaNumber beginningText="$" value={convertedMarketTotalLended * rate} className="value" />
                        <CommaNumber value={convertedMarketTotalLended} className="rate" />
                      </ThreeLevelListItem>
                      <ThreeLevelListItem>
                        <div className="name">Earn APY</div>
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
                        <div className="name">Total Earned</div>
                        <CommaNumber
                          value={convertNumberForClient({ number: interestEarned, grade: decimals })}
                          className="value"
                          beginningText="$"
                        />
                      </ThreeLevelListItem>
                      <ThreeLevelListItem>
                        <div className="name">Suppliers</div>
                        <CommaNumber value={suppliers} className="value" />
                      </ThreeLevelListItem>
                      <ThreeLevelListItem>
                        <div className="name">Utilization Rate</div>
                        <CommaNumber value={utilisationRate} className="value" endingText="%" />
                      </ThreeLevelListItem>
                      <Link to={{ pathname: `/loans/${address}/${LEND_TAB_ID}`, state: { from: '/loans' } }}>
                        <Button text="Lend" kind={ACTION_PRIMARY} iconAfter icon="arrowRight" />
                      </Link>
                    </div>
                    <div className="row">
                      <ThreeLevelListItem>
                        <div className="name">Total Borrow</div>
                        <CommaNumber beginningText="$" value={convertedMarketTotalBorrowed * rate} className="value" />
                        <CommaNumber value={convertedMarketTotalBorrowed} className="rate" />
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
                        <CommaNumber
                          value={
                            Math.max(convertNumberForClient({ number: availableLiquidity, grade: decimals }), 0) * rate
                          }
                          className="value"
                          beginningText="$"
                        />
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
                      <Link to={{ pathname: `/loans/${address}/${BORROW_TAB_ID}`, state: { from: '/loans' } }}>
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

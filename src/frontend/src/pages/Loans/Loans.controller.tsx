import { Link } from 'react-router-dom'
import classNames from 'classnames'
import { useEffect, useMemo, useState } from 'react'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import Button from 'app/App.components/Button/NewButton'
import { Chart } from 'app/App.components/Chart/Chart'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import {
  LoansStyled,
  MarketChartsContainer,
  MarketOverview,
  MarketsOverviewContainer,
  ThreeLevelListItem,
} from './Loans.style'
import { EmptyContainer } from 'app/App.style'
import { Page } from 'styles'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import Icon from 'app/App.components/Icon/Icon.view'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

// consts
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { DEFAULT_LOANS_ACTIVE_SUBS, LOANS_MARKETS_DATA } from 'providers/LoansProvider/helpers/loans.const'
import { BORROW_TAB_ID, LEND_TAB_ID } from './Loans.const'
import colors from 'styles/colors'
import { CURRENCY_AMOUNT_DATE_TOOLTIP } from 'app/App.components/Chart/Tooltips/ChartTooltip'
import { DEFAULT_VAULTS_ACTIVE_SUBS, VAULTS_ALL, VAULTS_DATA } from 'providers/VaultsProvider/vaults.provider.consts'
import { AREA_CHART_TYPE } from 'app/App.components/Chart/helpers/Chart.const'

// utils
import { getChartDataBasedOnLength, getChartSettingsBasedOnChartLength } from './Loans.helpers'
import { checkWhetherTokenIsM_Token, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'

// hooks
import useLoansCharts from 'providers/LoansProvider/hooks/useLoansCharts'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'
import { EARN_APY } from 'texts/tooltips/loan.text'
import { APR } from 'texts/tooltips/vault.text'
import { buildCollateralQuery } from './utils'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { gql } from '@apollo/client'
import { z } from 'zod'

const CHART_SETTINGS = {
  width: 450,
  height: 270,
  hideXAxis: true,
  hideYAxis: true,
  isPeriod: true,
}

export const tokenCollateralSchema = z.record(
  z.string(),
  z.object({
    aggregate: z.object({
      sum: z.object({
        balance: z.number(),
      }),
    }),
  }),
)

export type CollateralResponse = z.infer<typeof tokenCollateralSchema>

export const Loans = () => {
  const {
    isLoading: isChartsLoading,
    chartsData: { totalLendingChart, totalBorrowingChart },
  } = useLoansCharts({
    calcTotalBorrowingChart: true,
    calcTotalLendingChart: true,
  })

  const { tokensMetadata, tokensPrices } = useTokensContext()
  const {
    changeLoansSubscriptionsList,
    marketsAddresses,
    marketsMapper,
    isLoading: isLoansLoading,
    config: { collateralFactor, liquidationFactor },
  } = useLoansContext()
  const { changeVaultsSubscriptionsList, isLoading: isVaultsLoading } = useVaultsContext()

  // total collaterals state
  const [rawTotalCollateralBalances, setRawTotalCollateralBalances] = useState<Record<string, number> | null>(null)

  const collateralsTotalQuery = useMemo(() => buildCollateralQuery(marketsAddresses), [marketsAddresses])

  useQueryWithRefetch(gql(collateralsTotalQuery), {
    skip: marketsAddresses.length === 0,
    onCompleted: (data: CollateralResponse) => {
      const parsedData = tokenCollateralSchema.safeParse(data)
      if (!parsedData.success) {
        console.error('Error parsing collateral data:', parsedData.error)
        return
      }
      const rawTotalCollateral = Object.entries(data).reduce<Record<string, number>>(
        (acc, [marketAddress, aggregator]) => {
          acc[marketAddress] = aggregator.aggregate.sum.balance
          return acc
        },
        {},
      )
      setRawTotalCollateralBalances(rawTotalCollateral)
    },
    onError: (error) => console.error(error, 'collateralsTotalQuery'),
  })

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

  const CHART_COLORS = useMemo(
    () => ({
      lineColor: colors[themeSelected].primaryChartColor,
      areaTopColor: colors[themeSelected].primaryChartColor,
      areaBottomColor: colors[themeSelected].primaryChartBottomColor,
      textColor: colors[themeSelected].regularText,
    }),
    [themeSelected],
  )

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
      <div className={classNames('chart', { emptyChart: !isChartsLoading && totalLendingChart.length === 0 })}>
        <Chart
          isLoading={isChartsLoading}
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
      <div className={classNames('chart', { emptyChart: !isChartsLoading && totalBorrowingChart.length === 0 })}>
        <Chart
          isLoading={isChartsLoading}
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
          <div className="text">Loading loan markets</div>
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

              const loanToken = getTokenDataByAddress({
                tokenAddress: marketAddress,
                tokensPrices,
                tokensMetadata,
              })

              if (!loanToken || !loanToken.rate || !market) return null
              const {
                loanMTokenAddress,
                utilisationRate,
                availableLiquidity,
                borrowers,
                totalBorrowed,
                suppliers,
                totalLended,
                totalRewards,
                borrowAPR,
                lendingAPY,
              } = market
              const mToken = getTokenDataByAddress({
                tokenAddress: loanMTokenAddress,
                tokensPrices,
                tokensMetadata,
              })

              const interestEarned =
                mToken && checkWhetherTokenIsM_Token(mToken)
                  ? convertNumberForClient({
                      number: totalRewards,
                      grade: mToken.mToken.interestRateDecimals,
                    })
                  : 0

              const { symbol, decimals, icon, rate, address } = loanToken

              const convertedMarketTotalLended = convertNumberForClient({
                number: totalLended,
                grade: decimals,
              })
              const convertedMarketTotalBorrowed = convertNumberForClient({
                number: totalBorrowed,
                grade: decimals,
              })

              const totalCollateralBalane =
                convertNumberForClient({
                  number: rawTotalCollateralBalances?.[marketAddress] ?? 0,
                  grade: decimals,
                }) * rate

              const totalCollateralColor =
                collateralFactor > liquidationFactor * 1.3
                  ? 'up'
                  : collateralFactor > liquidationFactor
                  ? 'neutral'
                  : 'down'
              return (
                <MarketOverview key={symbol}>
                  <div className="asset-info">
                    <ImageWithPlug useRounded imageLink={icon} alt={`${symbol} logo`} />
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
                          <CommaNumber value={lendingAPY} className="value" endingText="%" />
                          <Tooltip>
                            <Tooltip.Trigger className="ml-5 mb-3 tooltip-trigger">
                              <Icon id="info" />
                            </Tooltip.Trigger>
                            <Tooltip.Content>{EARN_APY}</Tooltip.Content>
                          </Tooltip>
                        </div>
                      </ThreeLevelListItem>
                      <ThreeLevelListItem>
                        <div className="name">Total Earned</div>
                        <CommaNumber value={interestEarned} className="value" beginningText="$" />
                      </ThreeLevelListItem>
                      <ThreeLevelListItem>
                        <div className="name">Suppliers</div>
                        <CommaNumber value={suppliers} className="value" />
                      </ThreeLevelListItem>
                      <ThreeLevelListItem>
                        <div className="name">Utilization Rate</div>
                        <CommaNumber value={utilisationRate} className="value" endingText="%" />
                      </ThreeLevelListItem>
                      <Link to={`/loans/${address}/${LEND_TAB_ID}`} state={{ from: '/loans' }}>
                        <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE}>
                          Earn <Icon id="arrowRight" />
                        </Button>
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
                          <CommaNumber value={borrowAPR} className="value" endingText="%" />
                          <Tooltip>
                            <Tooltip.Trigger className="ml-5 mb-3 tooltip-trigger">
                              <Icon id="info" />
                            </Tooltip.Trigger>
                            <Tooltip.Content>{APR}</Tooltip.Content>
                          </Tooltip>
                        </div>
                      </ThreeLevelListItem>
                      <ThreeLevelListItem>
                        <div className="name">Available Liquidity</div>
                        <CommaNumber
                          value={
                            Math.max(
                              convertNumberForClient({
                                number: availableLiquidity,
                                grade: decimals,
                              }),
                              0,
                            ) * rate
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
                          value={totalCollateralBalane}
                          className={`value ${totalCollateralColor}`}
                          beginningText="$"
                        />
                      </ThreeLevelListItem>
                      <Link to={`/loans/${address}/${BORROW_TAB_ID}`} state={{ from: '/loans' }}>
                        <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE}>
                          Borrow <Icon id="arrowRight" />
                        </Button>
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

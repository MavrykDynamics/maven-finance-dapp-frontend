import { useContext, useMemo } from 'react'
import { useHistory } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// components
import { Page } from 'styles'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { LoansEarnBorrow } from './LoansEarnBorrow.view'
import { EarnBorrowTotalCharts } from './Components/EarnBorrowTotalCharts.view'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

// styles
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'

// types
import { MarketSettingsType, MarketType } from './LoansEarnBorrow.consts'

// helpers
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getMarketUserLengingItem } from 'providers/LoansProvider/helpers/loans.utils'

// actions
import { getLoansStorage } from 'pages/Loans/Actions/getLoansData.actions'

// providers
import useLoansCharts from 'providers/LoansProvider/hooks/useLoansCharts'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useLoansPopupsContext } from 'providers/LoansProvider/LoansModals.provider'

const marketSettings: MarketSettingsType = {
  priceName: 'Oracle Price',
  totalName: 'Total Earning',
  leftValueName: 'Your Position',
  rightValueName: 'Earned to Date',
  buttonName: 'Deposit & Earn',
  marketTabName: 'lendingTab',
}

export const LoansEarn = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const {
    isLoading: isChartsLoading,
    chartsData: { totalBorrowingChart, totalLendingChart, marketLendingChart },
  } = useLoansCharts({
    calcTotalBorrowingChart: true,
    calcTotalLendingChart: true,
    calcMarketLendingChart: true,
  })

  const { tokensMetadata, tokensPrices } = useTokensContext()

  const {
    accountPkh,
    user: { userMTokens },
  } = useSelector((state: State) => state.wallet)

  const { isDataLoaded, loanTokens } = useSelector((state: State) => state.loans)

  const { totalBorrowed, totalLended } = useMemo(
    () =>
      loanTokens.reduce<{
        totalLended: number
        totalBorrowed: number
      }>(
        (acc, { totalBorrowed, totalLended, loanTokenAddress }) => {
          const { symbol } = tokensMetadata[loanTokenAddress]
          const rate = tokensPrices[symbol]

          acc.totalBorrowed += totalBorrowed * rate
          acc.totalLended += totalLended * rate
          return acc
        },
        {
          totalLended: 0,
          totalBorrowed: 0,
        },
      ),
    [loanTokens, tokensMetadata, tokensPrices],
  )

  const { openAddLendingAssetPopup } = useLoansPopupsContext()

  const markets: MarketType[] = useMemo(
    () =>
      loanTokens.map((item) => {
        const chartData = marketLendingChart[item.loanTokenAddress] ?? []
        const { symbol, icon } = tokensMetadata[item.loanTokenAddress]
        const price = tokensPrices[symbol]
        const { lendValue = 0, interestEarned = 0 } =
          getMarketUserLengingItem(userMTokens, item.loanMTokenAddress) ?? {}

        return {
          icon,
          symbol,
          annualRate: item.lendingAPY,
          annualRateName: 'APY',
          leftValue: lendValue * price,
          rightValue: interestEarned * price,
          totalAmount: item.totalLended,
          price,
          chartData,
        }
      }),
    [loanTokens, marketLendingChart, tokensMetadata, tokensPrices],
  )

  // TODO: pass address here
  const handleEarn = (marketTokenAddress: string) => {
    const market = loanTokens.find((item) => item.loanMTokenAddress === marketTokenAddress)
    if (!market) return

    const { lendValue, mBalance = 0 } = getMarketUserLengingItem(userMTokens, market.loanMTokenAddress) ?? {}

    //  if the user has already supplied to the specific asset pool we will route to asset market
    if (lendValue) {
      history.push(`/loans/${market.loanMTokenAddress}/lendingTab`)
      return
    }

    openAddLendingAssetPopup({
      mBalance,
      lendingAPY: market.lendingAPY,
      tokenAddress: market.loanTokenAddress,
    })
  }

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

  return (
    <Page>
      <PageHeader page={'loansEarn'} />

      {isLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading charts of earnings</div>
        </DataLoaderWrapper>
      ) : (
        <>
          <EarnBorrowTotalCharts
            // left chart
            leftChartData={totalLendingChart}
            leftChartTitle="Total Earning"
            leftTotalAmount={totalLended}
            // right chart
            rightChartData={totalBorrowingChart}
            rightChartTitle="Total Borrowing"
            rightTotalAmount={totalBorrowed}
          />

          <LoansEarnBorrow
            title="Earn"
            markets={markets}
            settings={marketSettings}
            handleClick={handleEarn}
            isDisabledButton={!accountPkh}
          />
        </>
      )}
    </Page>
  )
}

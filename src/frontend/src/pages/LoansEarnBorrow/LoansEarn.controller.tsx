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
import { loansPopupsContext } from 'pages/Loans/Components/Modals/LoansModals.provider'

// actions
import { getLoansStorage } from 'pages/Loans/Actions/getLoansData.actions'

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

  const { accountPkh } = useSelector((state: State) => state.wallet)

  const {
    isDataLoaded,
    loanTokens,
    chartsData: { lendingChartData, borrowingChartData },
  } = useSelector((state: State) => state.loans)

  const { totalBorrowed, totalLended } = useMemo(
    () =>
      loanTokens.reduce<{
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
      ),
    [loanTokens],
  )

  const { openAddLendingAssetPopup } = useContext(loansPopupsContext)

  const markets: MarketType[] = useMemo(
    () =>
      loanTokens.map((item) => ({
        icon: item.loanTokenData.icon,
        symbol: item.loanTokenData.symbol,
        annualRate: item.lendingAPY,
        annualRateName: 'APY',
        leftValue: item.lendingItem?.lendValue ?? 0 * item.loanTokenData.rate,
        rightValue: item.lendingItem?.interestEarned ?? 0 * item.loanTokenData.rate,
        totalAmount: item.totalLended,
        price: item.loanTokenData.rate,
        chartData: item.marketLiquidityChartData,
      })),
    [loanTokens],
  )

  const handleEarn = (marketSymbol: string) => {
    const market = loanTokens.find((item) => item.loanTokenData.symbol === marketSymbol)
    if (!market) return

    //  if the user has already supplied to the specific asset pool we will route to asset market
    if (market.lendingItem?.lendValue) {
      history.push(`/loans/${market.loanTokenData.symbol}/lendingTab`)
      return
    }

    openAddLendingAssetPopup({
      mBalance: market.lendingItem?.mBalance ?? 0,
      lendingAPY: market.lendingAPY,
      ...market.loanTokenData,
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
            leftChartData={lendingChartData}
            leftChartTitle="Total Earning"
            leftTotalAmount={totalLended}
            // right chart
            rightChartData={borrowingChartData}
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

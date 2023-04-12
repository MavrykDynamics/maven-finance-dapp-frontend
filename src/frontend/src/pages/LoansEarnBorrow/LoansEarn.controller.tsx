import { useContext, useMemo } from 'react'
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
import { LoanMarketType } from 'utils/TypesAndInterfaces/Loans'

// helpers
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { loansPopupsContext } from 'pages/Loans/Components/Modals/LoansModals.provider'

// actions
import { getLoansStorage } from 'pages/Loans/Actions/getLoansData.actions'

const marketSettings: MarketSettingsType = {
  priceName: 'Oracle Price',
  totalName: 'Total Earning',
  buttonName: 'Deposit & Earn',
  marketTabName: 'lendingTab',
}

export const LoansEarn = () => {
  const dispatch = useDispatch()

  const { accountPkh } = useSelector((state: State) => state.wallet)

  const {
    isDataLoaded,
    loanTokens,
    chartsData: { lendingChartData, borrowingChartData },
  } = useSelector((state: State) => state.loans)

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

  const { openAddLendingAssetPopup } = useContext(loansPopupsContext)

  const markets: MarketType[] = useMemo(
    () =>
      loanTokens.map((item) => ({
        icon: item.loanTokenData.icon,
        symbol: item.loanTokenData.symbol,
        annualRate: item.lendingAPY,
        annualRateName: 'APY',
        totalAmount: item.totalLended,
        price: item.loanTokenData.rate,
        chartData: item.marketLiquidityChartData,
      })),
    [loanTokens],
  )

  const handleEarn = (marketSymbol: string) => {
    const market = loanTokens.find((item) => item.loanTokenData.symbol === marketSymbol)
    if (!market) return

    openAddLendingAssetPopup({
      mBalance: market.lendingItem?.mBalance ?? 0,
      lendingAPY: market.lendingAPY,
      ...market.loanTokenData,
    })
  }

  const { isLoading } = useDataLoader(async () => {
    try {
      if (!isDataLoaded) {
        await dispatch(getLoansStorage())
      }
    } catch (e) {}
  }, [isDataLoaded])

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

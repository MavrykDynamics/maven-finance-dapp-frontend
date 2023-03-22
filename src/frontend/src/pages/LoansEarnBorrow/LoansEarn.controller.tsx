import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// components
import { Page } from 'styles'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { LoansEarnBorrow } from './LoansEarnBorrow.view'
import { EarnBorrowTotalCharts } from './Components/EarnBorrowTotalCharts.view'
import { EarnBorrowCard } from './Components/EarnBorrowCard.view'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

// styles
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'

// types
import { MarketSettingsType } from './LoansEarnBorrow.consts'

// helpers
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'

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
    chartsData: { lendingChartData, borrowingChartData, totalLended, totalBorrowed },
  } = useSelector((state: State) => state.loans)

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

          <LoansEarnBorrow title="Earn">
            {loanTokens.map((item) => (
              <EarnBorrowCard
                key={item.loanTokenData.name}
                market={{
                  icon: item.loanTokenData.icon,
                  symbol: item.loanTokenData.symbol,
                  annualRate: item.lendingAPY,
                  annualRateName: 'APY',
                  totalAmount: item.totalLended,
                  price: item.loanTokenData.rate,
                  chartData: item.marketLiquidityChartData,
                }}
                settings={marketSettings}
                userAddress={accountPkh}
              />
            ))}
          </LoansEarnBorrow>
        </>
      )}
    </Page>
  )
}

import { useEffect, useMemo } from 'react'
import { useHistory } from 'react-router'

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

// providers
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useLoansPopupsContext } from 'providers/LoansProvider/LoansModals.provider'
import useLoansCharts from 'providers/LoansProvider/hooks/useLoansCharts'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'

// consts
import { LOANS_MARKETS_DATA, DEFAULT_LOANS_ACTIVE_SUBS } from 'providers/LoansProvider/helpers/loans.const'

// helpers
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import { loansEarnBorrowContext } from './context/loansEarnBorrowContext'

const marketSettings: MarketSettingsType = {
  priceName: 'Oracle Price',
  totalName: 'Total Earning',
  leftValueName: 'Your Position',
  rightValueName: 'Earned to Date',
  buttonName: 'Deposit & Earn',
  marketTabName: 'lendingTab',
}

export const LoansEarn = () => {
  const history = useHistory()

  const {
    isLoading: isChartsLoading,
    chartsData: { totalBorrowingChart, totalLendingChart, marketLendingChart },
  } = useLoansCharts({
    calcTotalBorrowingChart: true,
    calcTotalLendingChart: true,
    calcMarketLendingChart: true,
  })

  const { openAddLendingAssetPopup } = useLoansPopupsContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { userAddress, userMTokens } = useUserContext()
  const { marketsAddresses, marketsMapper, changeLoansSubscriptionsList, isLoading: isLoansLoading } = useLoansContext()

  useEffect(() => {
    changeLoansSubscriptionsList({
      [LOANS_MARKETS_DATA]: true,
    })

    return () => changeLoansSubscriptionsList(DEFAULT_LOANS_ACTIVE_SUBS)
  }, [])

  const markets = useMemo(
    () =>
      marketsAddresses.reduce<MarketType[]>((acc, marketAddress) => {
        const market = marketsMapper[marketAddress]
        const chartData = marketLendingChart[marketAddress] ?? []

        const token = getTokenDataByAddress({
          tokenAddress: marketAddress,
          tokensPrices,
          tokensMetadata,
        })

        if (!token || !token.rate || !market) return acc

        const { rate: price, decimals, icon, symbol, address } = token
        const { lendingAPY, loanMTokenAddress } = market

        const { lendValue = 0, interestEarned = 0 } = userMTokens[loanMTokenAddress] ?? {}

        acc.push({
          icon,
          symbol,
          address,
          annualRate: lendingAPY,
          annualRateName: 'APY',
          leftValue: convertNumberForClient({ number: lendValue, grade: decimals }) * price,
          rightValue: convertNumberForClient({ number: interestEarned, grade: decimals }) * price,
          totalAmount: chartData.at(-1)?.value ?? 0,
          price,
          chartData,
        })

        return acc
      }, []),
    [marketLendingChart, marketsAddresses, marketsMapper, tokensMetadata, tokensPrices, userMTokens],
  )

  const handleEarn = (marketTokenAddress: string) => {
    const market = marketsMapper[marketTokenAddress]
    if (!market) return

    const lendItem = userMTokens[market.loanMTokenAddress]

    //  if the user has already supplied to the specific asset pool we will route to asset market
    if (lendItem) {
      history.push(`/loans/${marketTokenAddress}/lendingTab`, { from: '/loans/earn' })
      return
    } else {
      openAddLendingAssetPopup({
        mBalance: 0,
        lendingAPY: market.lendingAPY,
        tokenAddress: market.loanTokenAddress,
      })
    }
  }

  const contextValue = useMemo(
    () => ({
      isLoading: isChartsLoading,
    }),
    [isChartsLoading],
  )

  return (
    <loansEarnBorrowContext.Provider value={contextValue}>
      <Page>
        <PageHeader page={'loansEarn'} />

        {isLoansLoading ? (
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
              leftTotalAmount={totalLendingChart.at(-1)?.value ?? 0}
              // right chart
              rightChartData={totalBorrowingChart}
              rightChartTitle="Total Borrowing"
              rightTotalAmount={totalBorrowingChart.at(-1)?.value ?? 0}
            />

            <LoansEarnBorrow
              title="Earn"
              markets={markets}
              settings={marketSettings}
              handleClick={handleEarn}
              isDisabledButton={!userAddress}
            />
          </>
        )}
      </Page>
    </loansEarnBorrowContext.Provider>
  )
}

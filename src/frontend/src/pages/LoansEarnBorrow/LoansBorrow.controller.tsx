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

// helpers
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { loansPopupsContext } from 'pages/Loans/Components/Modals/LoansModals.provider'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR } from 'app/App.components/Toaster/Toaster.constants'

// actions
import { getLoansStorage } from 'pages/Loans/Actions/getLoansData.actions'

const marketSettings: MarketSettingsType = {
  priceName: 'Oracle Price',
  totalName: 'Total Borrowed',
  buttonName: 'Borrow',
  isButtonSymbol: true,
  marketTabName: 'borrowTab',
}

export const LoansBorrow = () => {
  const dispatch = useDispatch()

  const { accountPkh } = useSelector((state: State) => state.wallet)

  const {
    isDataLoaded,
    loanTokens,
    config: { DAOFee },
    chartsData: { collateralChartData, borrowingChartData, totalCollateraled, totalBorrowed },
  } = useSelector((state: State) => state.loans)

  const { openBorrowPopup } = useContext(loansPopupsContext)

  const markets: MarketType[] = useMemo(
    () =>
      loanTokens.map((item) => ({
        icon: item.loanTokenData.icon,
        symbol: item.loanTokenData.symbol,
        annualRate: item.borrowAPR,
        annualRateName: 'APR',
        totalAmount: item.totalBorrowed,
        price: item.loanTokenData.rate,
        chartData: item.marketCollateralChartData,
      })),
    [loanTokens],
  )

  const handleBorrow = (marketSymbol: string) => {
    const market = loanTokens.find((item) => item.loanTokenData.symbol === marketSymbol)
    if (!market) return

    const validVault = market.myBorrowingList.find((item) => item.collateralRatio > 200)

    if (!validVault) {
      dispatch(showToaster(ERROR, 'Error', 'The market does not have a vault to borrow'))
      return
    }

    openBorrowPopup?.({
      vaultId: validVault.vaultId,
      borrowedAsset: validVault.borrowedAsset,
      collateralRatio: validVault.collateralRatio,
      borrowAPR: validVault.apr,
      currentCollateralBalance: validVault.collateralData.at(-1)?.amount ?? 0,
      hasUserBorrowed: false,
      borrowCapacity: validVault.borrowCapacity,
      currentBorrowedAmount: validVault.borrowedAmount,
      DAOFee,
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
      <PageHeader page={'loansBorrow'} />

      {isLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading borrows charts</div>
        </DataLoaderWrapper>
      ) : (
        <>
          <EarnBorrowTotalCharts
            // left chart
            leftChartData={collateralChartData}
            leftChartTitle="Total Collateral"
            leftTotalAmount={totalCollateraled}
            // right chart
            rightChartData={borrowingChartData}
            rightChartTitle="Total Borrowing"
            rightTotalAmount={totalBorrowed}
          />

          <LoansEarnBorrow
            title="Borrow"
            markets={markets}
            settings={marketSettings}
            handleClick={handleBorrow}
            isDisabledButton={!accountPkh}
          />
        </>
      )}
    </Page>
  )
}

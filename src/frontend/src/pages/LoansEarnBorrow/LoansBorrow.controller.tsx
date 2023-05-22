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
import { TOASTER_ERROR } from 'app/App.components/Toaster/Toaster.constants'

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
    vaults: { allVaultsIds, vaultsMapper },
    chartsData: { collateralChartData, borrowingChartData },
  } = useSelector((state: State) => state.loans)

  const { totalCollaterals, totalBorrowed } = useMemo(
    () =>
      allVaultsIds.reduce<{
        totalCollaterals: number
        totalBorrowed: number
      }>(
        (acc, vaultId) => {
          const vault = vaultsMapper[vaultId]

          acc.totalCollaterals += vault.collateralBalance
          acc.totalBorrowed += vault.borrowedAmount * vault.borrowedAsset.rate
          return acc
        },
        {
          totalCollaterals: 0,
          totalBorrowed: 0,
        },
      ),
    [allVaultsIds, vaultsMapper],
  )

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
    const validVaultId = allVaultsIds.find((vaultId) => {
      const vault = vaultsMapper[vaultId]
      return marketSymbol === vault.borrowedAsset.symbol && vault.collateralRatio > 200
    })

    if (!validVaultId) {
      dispatch(showToaster(TOASTER_ERROR, 'Error', 'The market does not have a vault to borrow'))
      return
    }

    const vault = vaultsMapper[validVaultId]

    openBorrowPopup?.({
      vaultId: vault.vaultId,
      borrowedAsset: vault.borrowedAsset,
      collateralRatio: vault.collateralRatio,
      borrowAPR: vault.apr,
      currentCollateralBalance: vault.collateralData.at(-1)?.amount ?? 0,
      hasUserBorrowed: false,
      borrowCapacity: vault.borrowCapacity,
      currentBorrowedAmount: vault.borrowedAmount,
      DAOFee,
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
    [isDataLoaded],
  )

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
            leftTotalAmount={totalCollaterals}
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

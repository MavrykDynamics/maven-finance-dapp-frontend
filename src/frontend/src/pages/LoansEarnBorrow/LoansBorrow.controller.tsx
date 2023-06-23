import { useContext, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router'
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

type TokenTypes = 'XTZ' | 'EURL' | 'USDT'

const marketSettings: MarketSettingsType = {
  priceName: 'Oracle Price',
  totalName: 'Total Borrowed',
  leftValueName: 'Outstanding debt',
  rightValueName: 'Collateral Amount',
  buttonName: 'Borrow',
  isButtonSymbol: true,
  marketTabName: 'borrowTab',
}

export const LoansBorrow = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const location = useLocation()

  const { accountPkh } = useSelector((state: State) => state.wallet)

  const {
    isDataLoaded,
    loanTokens,
    vaults: { allVaultsIds, myVaultsIds, vaultsMapper },
    chartsData: { collateralChartData, borrowingChartData },
  } = useSelector((state: State) => state.loans)

  const { totalCollaterals, totalBorrowed, tokenTotals } = useMemo(
    () =>
      allVaultsIds.reduce(
        (acc, vaultId) => {
          const vault = vaultsMapper[vaultId]
          const token = vault.borrowedAsset.symbol as TokenTypes

          acc.totalCollaterals += vault.collateralBalance
          acc.totalBorrowed += vault.borrowedAmount * vault.borrowedAsset.rate

          if (vault.ownerId === accountPkh) {
            acc.tokenTotals[token].userTotalBorrowed += vault.borrowedAmount * vault.borrowedAsset.rate
            acc.tokenTotals[token].userTotalCollateral += vault.collateralBalance
          }

          return acc
        },
        {
          totalCollaterals: 0,
          totalBorrowed: 0,
          tokenTotals: {
            XTZ: {
              userTotalBorrowed: 0,
              userTotalCollateral: 0,
            },
            EURL: {
              userTotalBorrowed: 0,
              userTotalCollateral: 0,
            },
            USDT: {
              userTotalBorrowed: 0,
              userTotalCollateral: 0,
            },
          },
        },
      ),
    [accountPkh, allVaultsIds, vaultsMapper],
  )

  const { openCreateVaultPopup } = useContext(loansPopupsContext)

  const markets: MarketType[] = useMemo(
    () =>
      loanTokens.map((item) => ({
        icon: item.loanTokenData.icon,
        symbol: item.loanTokenData.symbol,
        annualRate: item.borrowAPR,
        annualRateName: 'APR',
        leftValue: tokenTotals[item.loanTokenData.symbol as TokenTypes].userTotalBorrowed ?? 0,
        rightValue: tokenTotals[item.loanTokenData.symbol as TokenTypes].userTotalCollateral ?? 0,
        totalAmount: item.totalBorrowed,
        price: item.loanTokenData.rate,
        chartData: item.marketCollateralChartData,
      })),
    [loanTokens, tokenTotals],
  )

  const handleCreatedVaultAddress = (address?: string) => {
    if (!address) return

    const params = new URLSearchParams(location.search)
    params.append('vaultAddress', address)
    history.replace({ ...location, search: params.toString() })
  }

  const handleBorrow = (marketSymbol: string) => {
    const validVaultId = myVaultsIds.find((vaultId) => {
      const vault = vaultsMapper[vaultId]
      return marketSymbol === vault.borrowedAsset.symbol && vault.collateralRatio > 200
    })

    if (!validVaultId) {
      openCreateVaultPopup?.({
        currentMarketAsset: marketSymbol === 'XTZ' ? 'tez' : marketSymbol.toLowerCase(),
        setCreatedVaultAddress: handleCreatedVaultAddress,
      })

      return
    }

    const vault = vaultsMapper[validVaultId]

    // if the user has already borrowing from the specific asset pool we will route to asset market
    if (vault) {
      history.push(`/loans/${vault.borrowedAsset.symbol}/borrowTab`)
    }
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

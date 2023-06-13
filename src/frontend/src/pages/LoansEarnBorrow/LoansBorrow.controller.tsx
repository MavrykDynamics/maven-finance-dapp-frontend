import { useEffect, useMemo, useState } from 'react'
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

// actions
import { getLoansStorage } from 'pages/Loans/Actions/getLoansData.actions'
import { useLoansPopupsContext } from 'providers/LoansProvider/LoansModals.provider'
import useLoansCharts from 'providers/LoansProvider/hooks/useLoansCharts'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { convertNumberForClient } from 'utils/calcFunctions'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import { getVaultCollateralBalance } from 'pages/Vaults/Vaults.helpers'
import { getCollateralRatio, getVaultBorrowCapacity } from 'providers/LoansProvider/helpers/vaults.utils'

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

  const { tokensMetadata, tokensPrices } = useTokensContext()

  const { accountPkh } = useSelector((state: State) => state.wallet)

  const {
    isDataLoaded,
    loanTokens,
    config: { DAOFee },
    vaults: { allVaultsIds, myVaultsIds, vaultsMapper },
  } = useSelector((state: State) => state.loans)

  const {
    isLoading: isChartsLoading,
    chartsData: { totalBorrowingChart, totalCollateralChart, marketCollateralChart },
  } = useLoansCharts({
    calcTotalBorrowingChart: true,
    calcTotalCollateralChart: true,
    calcMarketCollateralChart: true,
  })

  const [newVaultAddress, setNewVaultAddress] = useState('')

  const { totalCollaterals, totalBorrowed, tokenTotals } = useMemo(
    () =>
      allVaultsIds.reduce<{
        totalCollaterals: 0
        totalBorrowed: 0
        tokenTotals: Record<
          TokenAddressType,
          {
            userTotalBorrowed: number
            userTotalCollateral: number
          }
        >
      }>(
        (acc, vaultId) => {
          const { ownerId, borrowedTokenAddress, borrowedAmount, collateralData } = vaultsMapper[vaultId]

          const { symbol: borrowedAssetSymbol, decimals: borrowedAssetDecimals } = tokensMetadata[borrowedTokenAddress]
          const borrowedAssetRate = tokensPrices[borrowedAssetSymbol]

          const vaultBorrowedInUsd =
            convertNumberForClient({ number: borrowedAmount, grade: borrowedAssetDecimals }) * borrowedAssetRate
          const vaultCollateralInUsd = collateralData.reduce((acc, { amount, tokenAddress }) => {
            const { symbol: collateralAssetSymbol, decimals: collateralAssetDecimals } = tokensMetadata[tokenAddress]
            const collateralRate = tokensPrices[collateralAssetSymbol]
            return (acc += convertNumberForClient({ number: amount, grade: collateralAssetDecimals }) * collateralRate)
          }, 0)

          acc.totalCollaterals += vaultCollateralInUsd
          acc.totalBorrowed += vaultBorrowedInUsd

          if (ownerId === accountPkh) {
            if (!acc.tokenTotals[borrowedTokenAddress]) {
              acc.tokenTotals[borrowedTokenAddress] = {
                userTotalBorrowed: vaultBorrowedInUsd,
                userTotalCollateral: vaultCollateralInUsd,
              }
            } else {
              acc.tokenTotals[borrowedTokenAddress].userTotalBorrowed += vaultBorrowedInUsd
              acc.tokenTotals[borrowedTokenAddress].userTotalCollateral += vaultCollateralInUsd
            }
          }

          return acc
        },
        {
          totalCollaterals: 0,
          totalBorrowed: 0,
          tokenTotals: {},
        },
      ),
    [accountPkh, allVaultsIds, tokensMetadata, tokensPrices, vaultsMapper],
  )

  const { openBorrowPopup, openCreateVaultPopup } = useLoansPopupsContext()

  const markets: MarketType[] = useMemo(
    () =>
      loanTokens.map((item) => {
        const chartData = marketCollateralChart[item.loanTokenAddress] ?? []
        const { symbol, icon } = tokensMetadata[item.loanTokenAddress]
        const price = tokensPrices[symbol]

        return {
          icon,
          symbol,
          annualRate: item.borrowAPR,
          annualRateName: 'APR',
          leftValue: tokenTotals[item.loanTokenAddress].userTotalBorrowed ?? 0,
          rightValue: tokenTotals[item.loanTokenAddress].userTotalCollateral ?? 0,
          totalAmount: item.totalBorrowed,
          price,
          chartData,
        }
      }),
    [loanTokens, marketCollateralChart, tokenTotals, tokensMetadata, tokensPrices],
  )

  const handleBorrow = (marketTokenAddress: string) => {
    const validVaultId = myVaultsIds.find((vaultId) => {
      const vault = vaultsMapper[vaultId]
      // TODO: add collateral check
      return marketTokenAddress === vault.borrowedTokenAddress // && vault.collateralRatio > 200
    })

    // redirect specific asset market if user does not have vaults with collateral ratio > 200
    if (!validVaultId) {
      openCreateVaultPopup?.({
        tokenAddress: marketTokenAddress,
        setCreatedVaultAddress: (address: string) => {
          if (!address) return
          setNewVaultAddress(address)
        },
      })

      return
    }

    const vault = vaultsMapper[validVaultId]

    if (!vault) return

    const borrowAPR = loanTokens.find(
      ({ loanTokenAddress }) => loanTokenAddress === vault.borrowedTokenAddress,
    )?.borrowAPR
    if (!borrowAPR) return

    const borrowedToken = tokensMetadata[vault.borrowedTokenAddress],
      borrowedTokenRate = tokensPrices[borrowedToken.symbol],
      convertedBorrowedAmount = convertNumberForClient({
        number: vault.borrowedAmount,
        grade: borrowedToken.decimals,
      }),
      collateralBalance = getVaultCollateralBalance(vault.collateralData, tokensMetadata, tokensPrices),
      collateralRatio = getCollateralRatio(collateralBalance, convertedBorrowedAmount, borrowedTokenRate),
      borrowCapacity = getVaultBorrowCapacity({
        availableLiquidity: vault.availableLiquidity,
        collateralBalance,
        borrowedAmount: vault.availableLiquidity,
        borrowedTokenRate,
        borrowedTokenDecimals: borrowedToken.decimals,
      })

    openBorrowPopup({
      vaultId: vault.vaultId,
      borrowedTokenMetadata: borrowedToken,
      borrowedAmount: convertedBorrowedAmount,
      collateralBalance,
      borrowCapacity,
      collateralRatio,
      borrowedTokenRate,
      DAOFee,
      borrowAPR,
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
            leftChartData={totalCollateralChart}
            leftChartTitle="Total Collateral"
            leftTotalAmount={totalCollaterals}
            // right chart
            rightChartData={totalBorrowingChart}
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

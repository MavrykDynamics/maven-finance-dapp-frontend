import { useEffect, useMemo, useState } from 'react'
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

// actions
import { getLoansStorage } from 'pages/Loans/Actions/getLoansData.actions'
import { useLoansPopupsContext } from 'providers/LoansProvider/LoansModals.provider'
import useLoansCharts from 'providers/LoansProvider/hooks/useLoansCharts'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { convertNumberForClient } from 'utils/calcFunctions'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'

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
      return marketTokenAddress === vault.borrowedTokenAddress
    })

    // create vault if user does not have vaults
    if (!validVaultId) {
      openCreateVaultPopup?.({
        showShortFlow: true,
        tokenAddress: marketTokenAddress,
        setCreatedVaultAddress: (address: string) => {
          if (!address) return
          setNewVaultAddress(address)
        },
      })

      return
    }

    //  if the user has already borrowed to the specific asset pool we will route to asset market
    history.push(`/loans/${marketTokenAddress}/borrowTab`)
  }

  // open borrow popup after getting new vault address
  useEffect(() => {
    if (!newVaultAddress) return

    const vault = vaultsMapper[newVaultAddress]
    if (!vault) return

    const borrowAPR = loanTokens.find(
      ({ loanTokenAddress }) => loanTokenAddress === vault.borrowedTokenAddress,
    )?.borrowAPR
    if (!borrowAPR) return

    openBorrowPopup?.({
      vault,
      DAOFee,
      borrowAPR,
      scrollToCurrentVault: () => {
        setNewVaultAddress('')
        // redirect to the market after borrowing
        history.push(`/loans/${vault.borrowedTokenAddress}/borrowTab/${newVaultAddress}`)
      },
    })
  }, [DAOFee, history, myVaultsIds, newVaultAddress, openBorrowPopup, vaultsMapper])

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

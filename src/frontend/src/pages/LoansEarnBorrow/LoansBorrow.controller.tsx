import { useEffect, useMemo } from 'react'
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
import { getVaultCollateralRatio, getVaultCollateralBalance } from 'providers/LoansProvider/helpers/vaults.utils'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import {
  LOANS_MARKETS_DATA,
  LOANS_MARKETS_ADDRESSES,
  DEFAULT_LOANS_ACTIVE_SUBS,
} from 'providers/LoansProvider/helpers/loans.const'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'

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
  const { openCreateVaultPopup } = useLoansPopupsContext()

  const { accountPkh } = useSelector((state: State) => state.wallet)

  const {
    isDataLoaded,
    vaults: { allVaultsIds, myVaultsIds, vaultsMapper },
  } = useSelector((state: State) => state.loans)

  const { marketsAddresses, marketsMapper, changeLoansSubscriptionsList, isLoading: isLoansLoading } = useLoansContext()

  useEffect(() => {
    changeLoansSubscriptionsList({
      [LOANS_MARKETS_DATA]: true,
      [LOANS_MARKETS_ADDRESSES]: true,
    })

    return () => changeLoansSubscriptionsList(DEFAULT_LOANS_ACTIVE_SUBS)
  }, [])

  const {
    isLoading: isChartsLoading,
    chartsData: { totalBorrowingChart, totalCollateralChart, marketCollateralChart },
  } = useLoansCharts({
    calcTotalBorrowingChart: true,
    calcTotalCollateralChart: true,
    calcMarketCollateralChart: true,
  })

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

          const borrowToken = getTokenDataByAddress({
            tokenAddress: borrowedTokenAddress,
            tokensPrices,
            tokensMetadata,
          })

          if (!borrowToken || !borrowToken.rate) return acc

          const { decimals: borrowTokenDecimals, rate: borrowTokenRate } = borrowToken

          const vaultBorrowedInUsd =
            convertNumberForClient({ number: borrowedAmount, grade: borrowTokenDecimals }) * borrowTokenRate
          const vaultCollateralInUsd = getVaultCollateralBalance(collateralData, tokensMetadata, tokensPrices)

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

  const markets = useMemo(
    () =>
      marketsAddresses.reduce<MarketType[]>((acc, marketTokenAddress) => {
        const market = marketsMapper[marketTokenAddress]
        const chartData = marketCollateralChart[marketTokenAddress] ?? []

        const token = getTokenDataByAddress({
          tokenAddress: marketTokenAddress,
          tokensPrices,
          tokensMetadata,
        })

        if (!token || !token.rate) return acc

        const { symbol, icon, rate: price, decimals, address } = token

        acc.push({
          icon,
          symbol,
          address,
          annualRate: market.borrowAPR,
          annualRateName: 'APR',
          leftValue: tokenTotals[marketTokenAddress]?.userTotalBorrowed ?? 0,
          rightValue: tokenTotals[marketTokenAddress]?.userTotalCollateral ?? 0,
          totalAmount: convertNumberForClient({ number: market.totalBorrowed, grade: decimals }),
          price,
          chartData,
        })

        return acc
      }, []),
    [marketsAddresses, marketCollateralChart, tokenTotals, tokensMetadata, tokensPrices],
  )

  const handleSetNewlyCreatedVaultAddress = (marketAddress: string) => (address: string) => {
    history.replace(`/loans/${marketAddress}/borrowTab?vaultAddress=${address}`)
  }

  const handleBorrow = (marketTokenAddress: string) => {
    // get first valid vault, it's vault where user can borrow, and it shares same token as market
    const validVaultId = myVaultsIds.find((vaultId) => {
      const vault = vaultsMapper[vaultId]

      if (marketTokenAddress !== vault.borrowedTokenAddress) return false

      const borrowToken = getTokenDataByAddress({
        tokenAddress: vault.borrowedTokenAddress,
        tokensMetadata,
        tokensPrices,
      })

      if (!borrowToken || !borrowToken.rate) return false

      const convertedBorrowedAmount = convertNumberForClient({
          number: vault.borrowedAmount,
          grade: borrowToken.decimals,
        }),
        collateralBalance = getVaultCollateralBalance(vault.collateralData, tokensMetadata, tokensPrices)

      return getVaultCollateralRatio(collateralBalance, convertedBorrowedAmount * borrowToken.rate) > 200
    })

    // if we don't have valid vault to borrow, open create new vault popup
    if (!validVaultId) {
      const marketAddress = marketsAddresses.find((marketCtxAddress) => marketTokenAddress === marketCtxAddress)
      const market = marketAddress ? marketsMapper[marketAddress] : null

      const marketToken = getTokenDataByAddress({
        tokenAddress: marketTokenAddress,
        tokensMetadata,
        tokensPrices,
      })

      if (market && marketToken && marketToken.rate) {
        const marketAvaliableLiquidity =
          convertNumberForClient({ number: market.availableLiquidity, grade: marketToken.decimals }) * marketToken.rate

        openCreateVaultPopup({
          marketTokenAddress: marketTokenAddress,
          setCreatedVaultAddress: handleSetNewlyCreatedVaultAddress(marketTokenAddress),
          avaliableLiquidity: marketAvaliableLiquidity,
        })
      }
    } else {
      const validVault = vaultsMapper[validVaultId]

      if (!validVault) return

      history.push(`/loans/${validVault.borrowedTokenAddress}/borrowTab`)
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

      {isLoading || isLoansLoading ? (
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

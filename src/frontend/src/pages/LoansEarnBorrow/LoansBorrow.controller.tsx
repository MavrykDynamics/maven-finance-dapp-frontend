import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

// hooks
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import useUserLoansData from 'providers/UserProvider/hooks/useUserLoansData'
import useLoansCharts from 'providers/LoansProvider/hooks/useLoansCharts'
import { useLoansPopupsContext } from 'providers/LoansProvider/LoansModals.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

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
// actions
import { convertNumberForClient } from 'utils/calcFunctions'
import { getVaultCollateralBalance, getVaultCollateralRatio } from 'providers/VaultsProvider/helpers/vaults.utils'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { DEFAULT_LOANS_ACTIVE_SUBS, LOANS_MARKETS_DATA } from 'providers/LoansProvider/helpers/loans.const'
import {
  DEFAULT_VAULTS_ACTIVE_SUBS,
  VAULTS_DATA,
  VAULTS_USER_ALL,
} from 'providers/VaultsProvider/vaults.provider.consts'
import { loansEarnBorrowContext } from './context/loansEarnBorrowContext'

const marketSettings: MarketSettingsType = {
  priceName: 'Oracle Price',
  totalName: 'Total Available',
  leftValueName: 'Outstanding Debt',
  rightValueName: 'Collateral Amount',
  buttonName: 'Borrow',
  isButtonSymbol: true,
  marketTabName: 'borrowTab',
}

export const LoansBorrow = () => {
  const navigate = useNavigate()

  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { openCreateVaultPopup } = useLoansPopupsContext()
  const { userAddress } = useUserContext()
  const { vaultsMapper, myVaultsIds, changeVaultsSubscriptionsList, isLoading: isVaultsLoading } = useVaultsContext()

  const { marketsAddresses, marketsMapper, changeLoansSubscriptionsList, isLoading: isLoansLoading } = useLoansContext()

  useEffect(() => {
    changeLoansSubscriptionsList({
      [LOANS_MARKETS_DATA]: true,
    })
    changeVaultsSubscriptionsList({
      [VAULTS_DATA]: VAULTS_USER_ALL,
    })

    return () => {
      changeVaultsSubscriptionsList(DEFAULT_VAULTS_ACTIVE_SUBS)
      changeLoansSubscriptionsList(DEFAULT_LOANS_ACTIVE_SUBS)
    }
  }, [])

  const {
    isLoading: isChartsLoading,
    chartsData: { totalBorrowingChart, totalCollateralChart, marketBorrowChart },
  } = useLoansCharts({
    calcTotalBorrowingChart: true,
    calcTotalCollateralChart: true,
    calcMarketBorrowChart: true,
  })

  const { userVaultsData, isLoading: isUserLoansDataLoading } = useUserLoansData()

  const markets = useMemo(
    () =>
      marketsAddresses.reduce<MarketType[]>((acc, marketTokenAddress) => {
        const market = marketsMapper[marketTokenAddress]
        const chartData = marketBorrowChart[marketTokenAddress] ?? {}
        const token = getTokenDataByAddress({
          tokenAddress: marketTokenAddress,
          tokensPrices,
          tokensMetadata,
        })

        if (!token || !token.rate || !market) return acc

        const { symbol, icon, rate: price, address, decimals } = token

        const marketAvailableLiquidity =
          convertNumberForClient({
            number: market.availableLiquidity,
            grade: decimals,
          }) * price

        acc.push({
          icon,
          symbol,
          address,
          annualRate: market.borrowAPR,
          annualRateName: 'APR',
          leftValue: userVaultsData[marketTokenAddress]?.principal ?? 0,
          rightValue: userVaultsData[marketTokenAddress]?.collateralBalance ?? 0,
          totalAmount: marketAvailableLiquidity, //chartData.total?.at(-1)?.value ?? 0,
          price,
          chartData,
        })

        return acc
      }, []),
    [marketsAddresses, marketsMapper, marketBorrowChart, tokensPrices, tokensMetadata, userVaultsData],
  )

  const handleSetNewlyCreatedVaultAddress = (marketAddress: string) => (address: string) => {
    navigate(`/loans/${marketAddress}/borrowTab?vaultAddress=${address}`, { state: { from: '/loans/borrow' } })
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
        convertedInterestAmount = convertNumberForClient({
          number: vault.accruedInterest,
          grade: borrowToken.decimals,
        }),
        totalOutstanding = convertedInterestAmount + convertedBorrowedAmount,
        collateralBalance = getVaultCollateralBalance(vault.collateralData, tokensMetadata, tokensPrices)

      return getVaultCollateralRatio(collateralBalance, totalOutstanding * borrowToken.rate) > 200
    })

    // if we don't have valid vault to borrow, open create new vault popup
    if (!validVaultId) {
      const market = marketsMapper[marketTokenAddress]
      const marketToken = getTokenDataByAddress({
        tokenAddress: marketTokenAddress,
        tokensMetadata,
        tokensPrices,
      })

      if (market && marketToken && marketToken.rate) {
        const marketAvailableLiquidity =
          convertNumberForClient({
            number: market.availableLiquidity,
            grade: marketToken.decimals,
          }) * marketToken.rate

        openCreateVaultPopup({
          marketTokenAddress: marketTokenAddress,
          setCreatedVaultAddress: handleSetNewlyCreatedVaultAddress(marketTokenAddress),
          availableLiquidity: marketAvailableLiquidity,
        })
      }
    } else {
      const validVault = vaultsMapper[validVaultId]

      if (!validVault) return

      navigate(`/loans/${validVault.borrowedTokenAddress}/borrowTab`, { state: { from: '/loans/borrow' } })
    }
  }

  const contextValue = useMemo(
    () => ({
      isChartsLoading,
    }),
    [isChartsLoading],
  )

  return (
    <loansEarnBorrowContext.Provider value={contextValue}>
      <Page>
        <PageHeader page={'loansBorrow'} />

        {isLoansLoading || isVaultsLoading || isUserLoansDataLoading ? (
          <DataLoaderWrapper>
            <ClockLoader width={150} height={150} />
            <div className="text">Loading your borrow data</div>
          </DataLoaderWrapper>
        ) : (
          <>
            <EarnBorrowTotalCharts
              // left chart
              leftChartData={totalCollateralChart}
              leftChartTitle="Total Collateral"
              leftTotalAmount={totalCollateralChart.at(-1)?.value ?? 0}
              // right chart
              rightChartData={totalBorrowingChart}
              rightChartTitle="Total Borrowing"
              rightTotalAmount={totalBorrowingChart.at(-1)?.value ?? 0}
            />

            <LoansEarnBorrow
              title="Borrow"
              markets={markets}
              settings={marketSettings}
              handleClick={handleBorrow}
              isDisabledButton={!userAddress}
            />
          </>
        )}
      </Page>
    </loansEarnBorrowContext.Provider>
  )
}

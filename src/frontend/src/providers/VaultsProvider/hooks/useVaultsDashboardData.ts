import { useState, useEffect } from 'react'

// hooks
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { useVaultsContext } from '../vaults.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// types
import { DashboardVaultsTabDataQuery } from 'utils/__generated__/graphql'
import { VaultsDashboardDataType } from '../vaults.provider.types'
import { TokensContext } from 'providers/TokensProvider/tokens.provider.types'

// consts
import { GET_VAULTS_DASHBOARD_DATA } from '../queries/vaultsDashboardData.query'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'

// utils
import { convertNumberForClient, getNumberInBounds } from 'utils/calcFunctions'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { getVaultCollateralRatio } from '../helpers/vaults.utils'
import { getAssetColor } from 'providers/TreasuryProvider/helpers/treasury.utils'
import { EMPTY_VAULTS_DASHBOARD_DATA } from '../vaults.provider.consts'

export const useVaultsDashboardData = () => {
  const { bug } = useToasterContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { setVaultsDashboardData, vaultsDashboardData } = useVaultsContext()

  const [indexerData, setIndexerData] = useState<null | DashboardVaultsTabDataQuery>(null)

  useQueryWithRefetch(GET_VAULTS_DASHBOARD_DATA, {
    onCompleted: (data) => {
      setIndexerData(data)
    },
    onError: (e) => {
      console.error(`DappConfigProvider query error: `, e)
      bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
    },
  })

  useEffect(() => {
    if (!indexerData) return

    const { reducedVaultsCollaterals, totalCollateralRatio, averageCollateralRatio, vaultTvl, activeVaults } =
      normalizeVaultsDashboardData({
        indexerData,
        tokensMetadata,
        tokensPrices,
      })

    setVaultsDashboardData({
      reducedVaultsCollaterals,
      totalCollateralRatio,
      averageCollateralRatio,
      vaultTvl,
      activeVaults,
    })
  }, [indexerData, tokensMetadata, tokensPrices])

  return {
    isLoading: vaultsDashboardData === null,
    vaultsDashboardData: vaultsDashboardData ?? EMPTY_VAULTS_DASHBOARD_DATA,
  }
}

const normalizeVaultsDashboardData = ({
  indexerData,
  tokensMetadata,
  tokensPrices,
}: {
  indexerData: DashboardVaultsTabDataQuery
  tokensMetadata: TokensContext['tokensMetadata']
  tokensPrices: TokensContext['tokensPrices']
}) => {
  const {
    lending_controller: [lendingControllerData],
  } = indexerData

  // calculating vaults tvl
  const { vaultTvl, reducedVaultsCollaterals } = lendingControllerData.allVaultsCollaterals.reduce<{
    vaultTvl: number
    reducedVaultsCollaterals: VaultsDashboardDataType['reducedVaultsCollaterals']
  }>(
    (acc, { balances_aggregate, token: { token_address } }, collateralIdx) => {
      const collateralToken = getTokenDataByAddress({
        tokenAddress: token_address,
        tokensMetadata,
        tokensPrices,
      })

      if (collateralToken && collateralToken.rate) {
        const collateralBalance = convertNumberForClient({
          number: Number(balances_aggregate.aggregate?.sum?.balance),
          grade: collateralToken.decimals,
        })
        acc.vaultTvl += collateralBalance * collateralToken.rate

        acc.reducedVaultsCollaterals.push({
          balance: Number(balances_aggregate.aggregate?.sum?.balance),
          tokenAddress: token_address,
          chartColor: getAssetColor(collateralIdx),
        })
      }

      return acc
    },
    {
      vaultTvl: 0,
      reducedVaultsCollaterals: [],
    },
  )

  const collateralsInBorrowedVaults = lendingControllerData.collateralsForActiveVaults.reduce(
    (acc, { balances_aggregate, token: { token_address } }) => {
      const collateralToken = getTokenDataByAddress({
        tokenAddress: token_address,
        tokensMetadata,
        tokensPrices,
      })

      if (collateralToken && collateralToken.rate) {
        acc +=
          convertNumberForClient({
            number: Number(balances_aggregate.aggregate?.sum?.balance),
            grade: collateralToken.decimals,
          }) * collateralToken.rate
      }

      return acc
    },
    0,
  )

  // calculating markets tvl
  const totalBorrowed = lendingControllerData.borrowedFromMarkets.reduce(
    (acc, { total_borrowed, token: { token_address } }) => {
      const marketToken = getTokenDataByAddress({
        tokenAddress: token_address,
        tokensMetadata,
        tokensPrices,
      })

      if (marketToken && marketToken.rate) {
        acc +=
          convertNumberForClient({ number: Number(total_borrowed), grade: marketToken.decimals }) * marketToken.rate
      }

      return acc
    },
    0,
  )

  const activeVaults = lendingControllerData.activeVaults.aggregate?.count ?? 0
  const totalCollateral = getVaultCollateralRatio(collateralsInBorrowedVaults, totalBorrowed, false)

  return {
    reducedVaultsCollaterals,
    vaultTvl,
    activeVaults,
    totalCollateralRatio: totalCollateral,
    averageCollateralRatio: getNumberInBounds(0, 250, totalCollateral / activeVaults),
  }
}

import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { getAssetColor } from 'providers/TreasuryProvider/helpers/treasury.utils'
import { convertNumberForClient, getNumberInBounds } from 'utils/calcFunctions'
import { getVaultCollateralRatio } from './vaults.utils'

// types
import { TokensContext } from 'providers/TokensProvider/tokens.provider.types'
import { DashboardVaultsTabDataQuery } from 'utils/__generated__/graphql'
import { VaultsDashboardDataType } from '../vaults.provider.types'

export const normalizeVaultsDashboardData = ({
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

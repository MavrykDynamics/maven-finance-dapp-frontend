import { getAssetColor } from './../Treasury/helpers/treasury.utils'
import { statusSortPriority } from './Vaults.consts'
import { TokensContext } from 'providers/TokensProvider/tokens.provider.types'
import { convertNumberForClient } from 'utils/calcFunctions'
import {
  getVaultCollateralBalance,
  getVaultCollateralRatio,
  getVaultStatus,
} from 'providers/LoansProvider/helpers/vaults.utils'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { FullLoansVaultType, VaultAssetData, VaultType } from 'providers/LoansProvider/helpers/vaults.types'
import { api } from 'utils/api/api'
import {
  getTimestampByLevelUrl,
  getTimestampByLevelHeaders,
  getTimestampByLevelSchema,
} from 'utils/api/api-helpers/getTimestampByLevel'

/**
 * used for vaults filter
 * @param vaultsMapper dictionary of <vaultAddress, vault data>
 * @param tokensMetadata dictionary of <tokenAddress, token metadata>
 * @returns list of addresses for: borrwed assets & collateral assets
 */
export const getVaultAssets = (
  vaultsMapper: Record<string, VaultType>,
  tokensMetadata: TokensContext['tokensMetadata'],
) => {
  const list = Object.values(vaultsMapper)

  return list.reduce<{
    collateralAssets: string[]
    loanAssets: string[]
  }>(
    (acc, { borrowedTokenAddress, collateralData }) => {
      const borrowedToken = getTokenDataByAddress({ tokenAddress: borrowedTokenAddress, tokensMetadata })

      if (borrowedToken?.symbol) acc.loanAssets.push(borrowedToken.symbol)

      Array.from({ length: collateralData.length }, (_, idx) => {
        const collateralToken = getTokenDataByAddress({
          tokenAddress: collateralData[idx].tokenAddress,
          tokensMetadata,
        })
        if (collateralToken?.symbol) acc.loanAssets.push(collateralToken.symbol)
      })

      return acc
    },
    {
      collateralAssets: [],
      loanAssets: [],
    },
  )
}

/**
 * Used on dashboard overview vautls tab
 * @param vaultIds array of vaults addresses
 * @param vaultsMapper dictionary <vaultAddress, vault data>
 * @param tokensMetadata dictionary <tokenAddress, token metadata>
 * @param tokensPrices dictionary <tokenSymbol, token rate>
 * @returns global TVL for vault, general collateral ratio, average collateral ratio, and list of collareral tokens that consist from balance, represent color and its address
 */
export const reduceVaultsAssets = (
  vaultIds: string[],
  vaultsMapper: Record<string, VaultType>,
  tokensMetadata: TokensContext['tokensMetadata'],
  tokensPrices: TokensContext['tokensPrices'],
) => {
  let vaultWithBalances = 0
  let totalBorrowedAmounts = 0
  let totalCollateralBalances = 0
  let colorIdx = 0

  const { assets, globalVaultTVL } = vaultIds.reduce<{
    globalVaultTVL: number
    collateralRatio: number
    avgCollateralRatio: number
    assets: Record<string, VaultAssetData>
  }>(
    (acc, vaultId) => {
      const { assets } = acc
      const { collateralData, borrowedAmount, borrowedTokenAddress } = vaultsMapper[vaultId]

      const token = getTokenDataByAddress({ tokenAddress: borrowedTokenAddress, tokensMetadata, tokensPrices })
      if (!token || !token.rate) return acc
      const { decimals: borrowedTokenDecimals, rate: borrowedTokenRate } = token

      const collateralBalance = getVaultCollateralBalance(collateralData, tokensMetadata, tokensPrices)

      totalBorrowedAmounts +=
        convertNumberForClient({ number: borrowedAmount, grade: borrowedTokenDecimals }) * borrowedTokenRate
      totalCollateralBalances += collateralBalance

      if (borrowedAmount && collateralBalance) {
        vaultWithBalances++
      }

      collateralData.forEach(({ amount, tokenAddress }) => {
        const token = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
        if (!token || !token.rate) return
        const { decimals: collateralDecimals, rate: collateralRate } = token

        const convertedAmount = convertNumberForClient({ number: amount, grade: collateralDecimals })

        acc.globalVaultTVL += convertedAmount * collateralRate

        if (assets[tokenAddress]) {
          assets[tokenAddress].balance += amount
        } else {
          assets[tokenAddress] = {
            balance: amount,
            chartColor: getAssetColor(colorIdx),
            tokenAddress,
          }
          colorIdx++
        }
      })

      return acc
    },
    {
      assets: {},
      globalVaultTVL: 0,
      collateralRatio: 0,
      avgCollateralRatio: 0,
    },
  )

  const collateralRatio = (totalCollateralBalances / totalBorrowedAmounts) * 100

  return {
    assetsBalances: Object.values(assets),
    globalVaultTVL,
    collateralRatio,
    avgCollateralRatio: collateralRatio / vaultWithBalances,
  }
}

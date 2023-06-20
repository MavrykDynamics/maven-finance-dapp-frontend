import { getAssetColor } from './../Treasury/helpers/treasury.utils'
import { Aggregator } from 'utils/generated/graphqlTypes'
import { Lending_Controller_Vault } from 'utils/generated/graphqlTypes'
import { symbolsAfterDecimalPoint } from 'utils/symbolsAfterDecimalPoint'
import { getOracleAggregatorLatestPrice } from './Vaults.actions'
import { statusSortPriority } from './Vaults.consts'
import { TokensContext } from 'providers/TokensProvider/tokens.provider.types'
import { convertNumberForClient } from 'utils/calcFunctions'
import {
  getVaultCollateralBalance,
  getVaultCollateralRatio,
  getVaultStatus,
} from 'providers/LoansProvider/helpers/vaults.utils'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { VaultAssetData, VaultType } from 'providers/LoansProvider/helpers/vaults.types'

// TODO: check whether i need this
export const normalizeOracleLatestPrice = (storage: { aggregator: Aggregator[] }) => {
  const { aggregator = [] } = storage

  if (!aggregator.length) return 0

  const [item] = aggregator

  return symbolsAfterDecimalPoint(item.last_completed_data / 10 ** item.decimals)
}

export const getOracleLatestPrices = async (vaults: Lending_Controller_Vault[]) => {
  const uniqueOracleAddresses = new Set<string>()

  vaults.map((item) => {
    const loanTokenOracleAddress = item.loan_token?.oracle?.address
    const collateralBalances = item.collateral_balances

    if (loanTokenOracleAddress) {
      uniqueOracleAddresses.add(loanTokenOracleAddress)
    }

    if (collateralBalances.length) {
      collateralBalances.map((collateral) => {
        if (collateral.collateral_token?.oracle?.address) {
          uniqueOracleAddresses.add(collateral.collateral_token.oracle?.address)
        }
      })
    }
  })

  const arrayUniqueOracleAddresses = [...uniqueOracleAddresses]
  const prices = await Promise.all(arrayUniqueOracleAddresses.map((item) => getOracleAggregatorLatestPrice(item)))

  const result: Record<string, number> = {}

  prices.map((item, index) => {
    if (typeof item === 'number') {
      result[arrayUniqueOracleAddresses[index]] = item
    }
  })

  return result
}

/**
 *
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

// VAULTS SORTINGS HELPER
export const sortByVaultCategory = ({
  vaultsMapper,
  vaultsIds,
  tokensMetadata,
  tokensPrices,
  status,
}: {
  vaultsMapper: Record<string, VaultType>
  vaultsIds: string[]
  tokensMetadata: TokensContext['tokensMetadata']
  tokensPrices: TokensContext['tokensPrices']
  status?: string
}) => {
  const dataToSort = vaultsIds ? [...vaultsIds] : []

  const updatedPriority = status ? { ...statusSortPriority, [status]: 0 } : statusSortPriority

  return dataToSort.sort((a, b) => {
    const vaultAToken = getTokenDataByAddress({ tokensMetadata, tokensPrices, tokenAddress: a })
    const vaultBToken = getTokenDataByAddress({ tokensMetadata, tokensPrices, tokenAddress: b })

    if (!vaultAToken || !vaultAToken.rate || !vaultBToken || !vaultBToken.rate) return 0

    const vaultABorrowedAmount =
      convertNumberForClient({ number: vaultsMapper[a].borrowedAmount, grade: vaultAToken.decimals }) * vaultAToken.rate
    const vaultBBorrowedAmount =
      convertNumberForClient({ number: vaultsMapper[b].borrowedAmount, grade: vaultBToken.decimals }) * vaultBToken.rate

    const vaultACollateralRatio = getVaultStatus(
      getVaultCollateralRatio(
        getVaultCollateralBalance(vaultsMapper[a].collateralData, tokensMetadata, tokensPrices),
        vaultABorrowedAmount,
      ),
      vaultABorrowedAmount,
    )

    const vaultBCollateralRatio = getVaultStatus(
      getVaultCollateralRatio(
        getVaultCollateralBalance(vaultsMapper[b].collateralData, tokensMetadata, tokensPrices),
        vaultBBorrowedAmount,
      ),
      vaultBBorrowedAmount,
    )

    return updatedPriority[vaultACollateralRatio] - updatedPriority[vaultBCollateralRatio]
  })
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

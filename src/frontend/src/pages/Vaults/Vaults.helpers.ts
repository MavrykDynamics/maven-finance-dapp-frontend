import { getAssetColor } from './../Treasury/helpers/treasury.utils'
import { Aggregator } from 'utils/generated/graphqlTypes'
import { Lending_Controller_Vault } from 'utils/generated/graphqlTypes'
import { symbolsAfterDecimalPoint } from 'utils/symbolsAfterDecimalPoint'
import { getOracleAggregatorLatestPrice } from './Vaults.actions'
import { statusSortPriority } from './Vaults.consts'
import { LoansVaultType } from 'utils/TypesAndInterfaces/Loans'
import { TokensContext } from 'providers/TokensProvider/tokens.provider.types'
import { convertNumberForClient } from 'utils/calcFunctions'
import { getVaultCollateralBalance } from 'providers/LoansProvider/helpers/vaults.utils'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

type OracleLatestProps = {
  aggregator: Aggregator[]
}

export const normalizeOracleLatestPrice = (storage: OracleLatestProps) => {
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

export const getVaultAssets = (
  vaultsMapper: Record<string, LoansVaultType>,
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
type SortByVaultCategoryProps = {
  vaultsMapper: Record<string, LoansVaultType>
  vaultsIds: string[]
  status?: string
}

export const sortByVaultCategory = ({ vaultsMapper, vaultsIds, status }: SortByVaultCategoryProps) => {
  const dataToSort = vaultsIds ? [...vaultsIds] : []

  const updatedPriority = status ? { ...statusSortPriority, [status]: 0 } : statusSortPriority

  return dataToSort.sort((a, b) => {
    const firstItem = '' //getVaultStatus() //vaultsMapper[a].status
    const secondItem = '' //getVaultStatus() //vaultsMapper[b].status

    return updatedPriority[firstItem] - updatedPriority[secondItem]
  })
}

// DASHBOARD VAULTS TAB HELPER
export type VaultAssetData = {
  balance: number
  chartColor: string
  tokenAddress: string
}

export type VaultAssetBalances = {
  globalVaultTVL: number
  collateralRatio: number
  avgCollateralRatio: number
  assets: Record<string, VaultAssetData>
}

export const reduceVaultsAssets = (
  vaultIds: string[],
  vaultsMapper: Record<string, LoansVaultType>,
  tokensMetadata: TokensContext['tokensMetadata'],
  tokensPrices: TokensContext['tokensPrices'],
) => {
  let vaultWithBalances = 0
  let totalBorrowedAmounts = 0
  let totalCollateralBalances = 0
  let colorIdx = 0

  const { assets, globalVaultTVL } = vaultIds.reduce<VaultAssetBalances>(
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

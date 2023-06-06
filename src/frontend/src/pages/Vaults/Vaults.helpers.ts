import { getAssetColor } from './../Treasury/helpers/treasury.utils'
import { Aggregator } from 'utils/generated/graphqlTypes'
import { Lending_Controller_Vault } from 'utils/generated/graphqlTypes'
import { symbolsAfterDecimalPoint } from 'utils/symbolsAfterDecimalPoint'
import { getOracleAggregatorLatestPrice } from './Vaults.actions'
import { statusSortPriority } from './Vaults.consts'
import { LoansVaultType } from 'utils/TypesAndInterfaces/Loans'

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

export const getVaultAssets = (vaultsMapper: Record<string, LoansVaultType>) => {
  const list = Object.values(vaultsMapper)

  const collateralAssets = new Set<string>()
  const loanAssets = new Set<string>()

  list.map(({ borrowedAsset, collateralData }) => {
    const { symbol = '' } = borrowedAsset

    if (symbol) {
      loanAssets.add(symbol)
    }

    if (collateralData.length) {
      collateralData.slice(0, -1).map(({ symbol }) => {
        if (symbol) {
          collateralAssets.add(symbol)
        }
      })
    }
  })

  return {
    collateralAssets: [...collateralAssets],
    loanAssets: [...loanAssets],
  }
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
    const firstItem = vaultsMapper[a].status
    const secondItem = vaultsMapper[b].status

    return updatedPriority[firstItem] - updatedPriority[secondItem]
  })
}

// DASHBOARD VAULTS TAB HELPER
export type VaultAssetData = {
  balance: number
  usdValue: number
  rate: number
  decimals: number
  name: string
  chartColor: string
  symbol: string
}

export type VaultAssetBalances = {
  globalVaultTVL: number
  collateralRatio: number
  avgCollateralRatio: number
  assets: Record<string, VaultAssetData>
}

export const reduceVaultsAssets = (vaultIds: string[], vaultsMapper: Record<string, LoansVaultType>) => {
  let vaultWithBalances = 0
  let totalBorrowedAmounts = 0
  let totalCollateralBalances = 0
  let colorIdx = 0

  const { assets, globalVaultTVL } = vaultIds.reduce<VaultAssetBalances>(
    (acc, vaultId) => {
      const { assets } = acc
      const { collateralData, borrowedAmount, collateralBalance } = vaultsMapper[vaultId]

      totalBorrowedAmounts += borrowedAmount
      totalCollateralBalances += collateralBalance

      if (borrowedAmount && collateralBalance) {
        vaultWithBalances++
      }

      if (collateralData.length !== 0) {
        collateralData.slice(0, -1).forEach((collateral) => {
          acc.globalVaultTVL += collateral.amount * collateral.rate

          if (collateral.symbol && assets[collateral.symbol]) {
            assets[collateral.symbol].balance += collateral.amount
            assets[collateral.symbol].usdValue += collateral.amount * collateral.rate
          } else if (collateral.symbol) {
            assets[collateral.symbol] = {
              balance: collateral.amount,
              usdValue: collateral.amount * collateral.rate,
              rate: collateral.rate,
              name: collateral.symbol,
              symbol: collateral.symbol,
              chartColor: getAssetColor(colorIdx),
              decimals: 0,
            }
            colorIdx++
          }
        })
      }

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

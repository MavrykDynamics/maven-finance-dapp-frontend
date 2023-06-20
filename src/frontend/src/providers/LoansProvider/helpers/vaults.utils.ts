import { statusSortPriority, vaultsStatuses } from 'pages/Vaults/Vaults.consts'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { TokensContext } from 'providers/TokensProvider/tokens.provider.types'
import { convertNumberForClient, getNumberInBounds } from 'utils/calcFunctions'
import { FullLoansVaultType, VaultType } from './vaults.types'
import dayjs from 'dayjs'
import { api } from 'utils/api/api'
import {
  getTimestampByLevelUrl,
  getTimestampByLevelHeaders,
  getTimestampByLevelSchema,
  TimestampByLevelResponceType,
} from 'utils/api/api-helpers/getTimestampByLevel'

// sort vaults by status
export const sortVaultsByStatus = async ({
  vaultsMapper,
  vaultsIds,
  tokensMetadata,
  tokensPrices,
}: {
  vaultsMapper: Record<string, VaultType>
  vaultsIds: string[]
  tokensMetadata: TokensContext['tokensMetadata']
  tokensPrices: TokensContext['tokensPrices']
}) => {
  try {
    const vaultsLiquidationTimestamps = await vaultsIds.reduce<Promise<Record<string, number | null>>>(
      async (promiseAcc, vaultAddress) => {
        const acc = await promiseAcc
        const { liquidationLvl } = vaultsMapper[vaultAddress]

        if (!liquidationLvl) {
          acc[vaultAddress] = null
          return acc
        }

        const { data: liquidationTimestamp } = await api<TimestampByLevelResponceType>(
          getTimestampByLevelUrl(liquidationLvl),
          { headers: getTimestampByLevelHeaders },
          getTimestampByLevelSchema,
        )

        acc[vaultAddress] = new Date(liquidationTimestamp).getTime()

        return acc
      },
      Promise.resolve({}),
    )

    return [...vaultsIds].sort((a, b) => {
      const vaultAToken = getTokenDataByAddress({ tokensMetadata, tokensPrices, tokenAddress: a })
      const vaultBToken = getTokenDataByAddress({ tokensMetadata, tokensPrices, tokenAddress: b })

      if (!vaultAToken || !vaultAToken.rate || !vaultBToken || !vaultBToken.rate) return 0

      const vaultABorrowedAmount =
        convertNumberForClient({ number: vaultsMapper[a].borrowedAmount, grade: vaultAToken.decimals }) *
        vaultAToken.rate
      const vaultBBorrowedAmount =
        convertNumberForClient({ number: vaultsMapper[b].borrowedAmount, grade: vaultBToken.decimals }) *
        vaultBToken.rate

      const vaultACollateralRatio = getVaultStatus({
        collateralRatio: getVaultCollateralRatio(
          getVaultCollateralBalance(vaultsMapper[a].collateralData, tokensMetadata, tokensPrices),
          vaultABorrowedAmount,
        ),
        borrowedAmount: vaultABorrowedAmount,
        liquidationTimestamp: vaultsLiquidationTimestamps[a],
      })

      const vaultBCollateralRatio = getVaultStatus({
        collateralRatio: getVaultCollateralRatio(
          getVaultCollateralBalance(vaultsMapper[b].collateralData, tokensMetadata, tokensPrices),
          vaultBBorrowedAmount,
        ),
        borrowedAmount: vaultBBorrowedAmount,
        liquidationTimestamp: vaultsLiquidationTimestamps[b],
      })

      return statusSortPriority[vaultACollateralRatio] - statusSortPriority[vaultBCollateralRatio]
    })
  } catch (e) {
    console.error('vaults sorting by status error')

    return vaultsIds
  }
}

/**
 *
 * @param collateralRatio collateral ratio of the vault
 * @param borrowedAmount how much borrowed from the vault
 * @param liquidationTimestamp when vault can be liquidated
 * @returns status of the vault one of vaultsStatuses
 */
export const getVaultStatus = ({
  collateralRatio,
  borrowedAmount,
  liquidationTimestamp,
}: {
  collateralRatio: number
  borrowedAmount: number
  liquidationTimestamp: number | null
}): FullLoansVaultType['status'] => {
  try {
    if (collateralRatio < 200 && collateralRatio > 150 && borrowedAmount > 0) return vaultsStatuses.AT_RISK
    if (collateralRatio <= 150 && borrowedAmount > 0 && !liquidationTimestamp) return vaultsStatuses.MARK

    if (
      collateralRatio <= 150 &&
      borrowedAmount > 0 &&
      liquidationTimestamp &&
      dayjs().unix() < dayjs(liquidationTimestamp).unix()
    )
      return vaultsStatuses.GRACE_PERIOD
    if (
      collateralRatio <= 150 &&
      borrowedAmount > 0 &&
      liquidationTimestamp &&
      dayjs().unix() >= dayjs(liquidationTimestamp).unix()
    )
      return vaultsStatuses.LIQUIDATABLE
  } catch (e) {
    return vaultsStatuses.ACTIVE
  }

  return vaultsStatuses.ACTIVE
}

/**
 *
 * @param availableLiquidity – pool tokens amount in USD
 * @param borrowedAmount – how much borrowed in the vault in USD
 * @param collateralBalance – collateral amount of the vault in USD
 * @returns how much user can borrow in USD in that vault
 */
export const getVaultBorrowCapacity = (availableLiquidity: number, borrowedAmount: number, collateralBalance: number) =>
  Math.min(collateralBalance / 2 - borrowedAmount, Math.max(availableLiquidity, 0))

/**
 *
 * @param collateralData – array of collaterals of the vault
 * @param tokensMetadata – metadata of all tokens
 * @param tokensPrices – list of token prices
 * @returns sum in USD of all collaterals in the vault
 */
export const getVaultCollateralBalance = (
  collateralData: VaultType['collateralData'],
  tokensMetadata: TokensContext['tokensMetadata'],
  tokensPrices: TokensContext['tokensPrices'],
) =>
  collateralData.reduce((acc, { amount, tokenAddress }) => {
    const token = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
    if (!token || !token.rate) return acc
    const { decimals: collateralDecimals, rate: collateralRate } = token

    return (acc += convertNumberForClient({ number: amount, grade: collateralDecimals }) * collateralRate)
  }, 0)

/**
 *
 * @param collateralAmount – USD amount of collaterals in the vault
 * @param borrowedAmount – USD amount of borrowed number for the vault
 * @returns collateral ratio for the vault
 *
 * collateral ratio – is the relation of the borrowed amount to collaterals amount:
 * if vault has borrowAmount 0, collateral ratio 0 if we don't have collaterals, or 250, if we have some
 */
export const getVaultCollateralRatio = (collateralAmount: number, borrowedAmount: number) => {
  // means we haven't borrowed anything
  if (collateralAmount === 0) return 0

  // means we haven't borrowed, but we have deposited
  if (borrowedAmount === 0) return 250

  const collateralRatio = (collateralAmount / Math.max(1, borrowedAmount)) * 100
  return getNumberInBounds(0, 250, Number(collateralRatio.toFixed(1)))
}

/**
 * @param totalOutstanding – USD amount of borrowed amount and fee of the vault
 * @param liquidationRatio – ??? TODO: add description
 * @returns liquidation price in USD
 */
export const getVaultLiquidationPrice = (totalOutstanding: number, liquidationRatio: number) =>
  totalOutstanding * (liquidationRatio / 1000)

/**
 * @param loanOutstandingTotal – USD amount of borrowed amount and fee of the vault
 * @param maxVaultLiquidationPercent – ??? TODO: add description
 * @returns ???
 */
export const calculateVaultMaxLiquidationAmount = (
  loanOutstandingTotal: number,
  maxVaultLiquidationPercent: number,
) => {
  return Math.trunc((loanOutstandingTotal * maxVaultLiquidationPercent) / 10000)
}

/**
 * @param adminLiquidationFeePercent – ??? TODO: add description
 * @param liquidationAmount – ??? TODO: add description
 * @returns ???
 */
export const calculateAdminLiquidationFee = (adminLiquidationFeePercent: number, liquidationAmount: number) => {
  return Math.trunc((adminLiquidationFeePercent * liquidationAmount) / 10000)
}

/**
 * @param collateralAmount – amount of 1 of the collateral tokens in USD
 * @param totalAmount – total collateralAmount in USD
 * @returns % of 1 token from all tokens
 */
export const calculateCollateralShare = (collateralAmount: number, totalAmount: number) => {
  if (totalAmount === 0) return 100
  return getNumberInBounds(0, 100, Number(((collateralAmount / totalAmount) * 100).toFixed(2)))
}

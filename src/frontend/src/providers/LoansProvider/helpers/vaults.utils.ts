import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { TokensContext } from 'providers/TokensProvider/tokens.provider.types'
import { LoansVaultType } from 'utils/TypesAndInterfaces/Loans'
import { convertNumberForClient, getNumberInBounds } from 'utils/calcFunctions'

/**
 *
 * @param collateralRatio collateral ratio of the vault
 * @param borrowedAmount how much borrowed from the vault
 * @returns status of the vault one of vaultsStatuses
 */
export const getVaultStatus = (collateralRatio: number, borrowedAmount: number) => {
  if (collateralRatio <= 200 && collateralRatio > 150 && borrowedAmount > 0) return vaultsStatuses.AT_RISK
  if (collateralRatio <= 150 && borrowedAmount > 0) return vaultsStatuses.GRACE_PERIOD

  return vaultsStatuses.ACTIVE

  // TODO: clarify whether to get status by colalteralRatio or via other calcs
  // old more complicated cals for vault status
  // gotStatusByCollateralRatio !== 'no status'
  //         ? gotStatusByCollateralRatio
  //         : item.loan_token?.oracle_id
  //         ? vaultStatusChecker({
  //             currentBlockLevel: currentBlock?.level ?? 0,
  //             liquidationEndLevel: item.liquidation_end_level,
  //             markedForLiquidationLevel: item.marked_for_liquidation_level,
  //             liquidationDelayInMinutes: lendingController.liquidation_delay_in_minutes,
  //             loanOutstandingTotal: item.loan_outstanding_total / 10 ** item.loan_decimals,
  //             loanTokenOracleAddress: item.loan_token.oracle_id,
  //             liquidationRatio: lendingController.liquidation_ratio,
  //             vaultCollateralTokens: normalizeCollateralTokens,
  //             collateralRatio: lendingController.collateral_ratio,
  //             oracleLatestPrices,
  //           })
  //         : 'no status'
}

/**
 *
 * @param availableLiquidity – pool tokens amount in USD
 * @param borrowedAmount – how much borrowed in the vault in USD
 * @param collateralBalance – collateral amount of the vault in USD
 * @returns how much user can borrow in USD in that vault
 */
export const getVaultBorrowCapacity = (
  availableLiquidity: number,
  borrowedAmount: number,
  collateralBalance: number,
) => {
  return Math.min(collateralBalance / 2 - borrowedAmount, Math.max(availableLiquidity, 0))
}

/**
 * @param collateralData – array of collaterals of the vault
 * @param tokensMetadata – metadata of all tokens
 * @param tokensPrices – list of token prices
 * @returns sum in USD of all collaterals in the vault
 */
export const getVaultCollateralBalance = (
  collateralData: LoansVaultType['collateralData'],
  tokensMetadata: TokensContext['tokensMetadata'],
  tokensPrices: TokensContext['tokensPrices'],
) => {
  return collateralData.reduce((acc, { amount, tokenAddress }) => {
    const token = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
    if (!token || !token.rate) return acc
    const { decimals: collateralDecimals, rate: collateralRate } = token

    return (acc += convertNumberForClient({ number: amount, grade: collateralDecimals }) * collateralRate)
  }, 0)
}

/**
 * @param collateralAmount – USD amount of collaterals in the vault
 * @param borrowedAmount – USD amount of borrowed number for the vault
 * @returns collateral ratio for the vault
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
 * @param liquidationRatio – ratio? TODO: add description
 * @returns liquidation price in USD
 */
export const getVaultLiquidationPrice = (totalOutstanding: number, liquidationRatio: number) => {
  return totalOutstanding * (liquidationRatio / 1000)
}

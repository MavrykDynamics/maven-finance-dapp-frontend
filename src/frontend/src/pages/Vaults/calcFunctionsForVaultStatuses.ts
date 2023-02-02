import { BLOCKS_PER_MINUTE } from 'utils/constants'

/**
 * This function is after the vault would be marked so the liquidation_end_level != 0 and no longer in the grace period
 * @param currentBlockLevel         - Have to get from the head data of the dapp. I'm sure we have this value in the dapp somewhere
 * @param liquidationEndLevel       - liquidation_end_level in the query
 * @param markedForLiquidationLevel - marked_for_liquidation_level
 * @param liquidationDelayInMinutes - liquidation_delay_in_minutes
 */
export function checkVaultIsLiquidatable(
  currentBlockLevel: number,
  liquidationEndLevel: number,
  markedForLiquidationLevel: number,
  liquidationDelayInMinutes: number,
): boolean {
  return (
    currentBlockLevel <= liquidationEndLevel &&
    !checkVaultIsInGracePeriod(currentBlockLevel, markedForLiquidationLevel, liquidationDelayInMinutes)
  )
}

/**
 * Checks if the vault is in its grace period. For the status flag GRACE PERIOD
 * @param currentBlockLevel         - Have to get from the head data of the dapp. I'm sure we have this value in the dapp somewhere
 * @param markedForLiquidationLevel - marked_for_liquidation_level
 * @param liquidationDelayInMinutes - liquidation_delay_in_minutes
 */
export function checkVaultIsInGracePeriod(
  currentBlockLevel: number,
  markedForLiquidationLevel: number,
  liquidationDelayInMinutes: number,
): boolean {
  const liquidationDelayInBlocks = liquidationDelayInMinutes * BLOCKS_PER_MINUTE // this constant should exist in the utils/constants. If not, create it and set it to 2
  return currentBlockLevel <= markedForLiquidationLevel + liquidationDelayInBlocks
}

/**
 *
 * @param currentBlockLevel
 * @param liquidationEndLevel       - liquidation_end_level
 * @param markedForLiquidationLevel - marked_for_liquidation_level
 * @param liquidationDelayInMinutes - liquidation_delay_in_minutes
 */
export function checkVaultCanBeRemarkedForLiquidation(
  currentBlockLevel: number,
  liquidationEndLevel: number,
  markedForLiquidationLevel: number,
  liquidationDelayInMinutes: number,
): boolean {
  return (
    currentBlockLevel > liquidationEndLevel &&
    liquidationEndLevel !== 0 &&
    markedForLiquidationLevel !== 0 &&
    !checkVaultIsInGracePeriod(currentBlockLevel, markedForLiquidationLevel, liquidationDelayInMinutes)
  )
}

/**
 * @param loanOutstandingTotal    - This should already be after dividing the indexer value by the loan_tokens decimal places
 * @param loanTokenOracleAddress  - loan_token.oracle_id
 * @param liquidationRatio        - liquidation_ratio
 * @param vaultCollateralTokens   - collateral_tokens array after normalizing it and prepping the data (after dividing the balances by the token decimals)
 */
export function isLiquidatableByRatio(
  loanOutstandingTotal: number,
  loanTokenOracleAddress: string,
  liquidationRatio: number,
  vaultCollateralTokens: any[],
  oracleLatestPrices: Record<string, number>,
): boolean {
  const vaultCollateralTokenBalances = vaultCollateralTokens.map((collateralToken: any) => {
    const oracleId = collateralToken.token.oracleId
    const collateralTokenLatestPrice = oracleLatestPrices[oracleId]
    const balanceInUSD = collateralToken.balance * collateralTokenLatestPrice

    return balanceInUSD
  })
  const totalCollateralValueInUSD = vaultCollateralTokenBalances.length
    ? vaultCollateralTokenBalances.reduce((accumulator, tokenBalance) => {
        return accumulator + tokenBalance
      })
    : 0

  const loanTokenLatestPrice = oracleLatestPrices[loanTokenOracleAddress]
  const loanOutstandingInUSD = loanOutstandingTotal * loanTokenLatestPrice

  return totalCollateralValueInUSD < (liquidationRatio * loanOutstandingInUSD) / 1000
}

/**
 *  Use this to check if a vault can be marked for liquidation. The status flag MARK
 * @param loanOutstandingTotal
 * @param loanTokenOracleAddress
 * @param liquidationRatio
 * @param vaultCollateralTokens
 * @param currentBlockLevel
 * @param liquidationEndLevel
 * @param markedForLiquidationLevel
 * @param liquidationDelayInMinutes
 */
export function checkVaultIsAbleToMarkedForLiquidation(
  loanOutstandingTotal: number,
  loanTokenOracleAddress: string,
  liquidationRatio: number,
  vaultCollateralTokens: any[],
  currentBlockLevel: number,
  liquidationEndLevel: number,
  markedForLiquidationLevel: number,
  liquidationDelayInMinutes: number,
  oracleLatestPrices: Record<string, number>,
): boolean {
  const isLiquidatableValue = isLiquidatableByRatio(
    loanOutstandingTotal,
    loanTokenOracleAddress,
    liquidationRatio,
    vaultCollateralTokens,
    oracleLatestPrices,
  )
  const canBeRemarked = checkVaultCanBeRemarkedForLiquidation(
    currentBlockLevel,
    liquidationEndLevel,
    markedForLiquidationLevel,
    liquidationDelayInMinutes,
  )

  return canBeRemarked || (isLiquidatableValue && !canBeRemarked)
}

/**
 * This function checks if the vault can currently be liquidated. Using if it's been marked and the collateral to loan value meets the criteria for liquidation
 * For the LIQUIDATABLE status
 * @param loanOutstandingTotal
 * @param loanTokenOracleAddress
 * @param liquidationRatio
 * @param vaultCollateralTokens
 * @param currentBlockLevel
 * @param liquidationEndLevel
 * @param markedForLiquidationLevel
 * @param liquidationDelayInMinutes
 */
export function checkVaultLiquidatableStatus(
  loanOutstandingTotal: number,
  loanTokenOracleAddress: string,
  liquidationRatio: number,
  vaultCollateralTokens: any[],
  currentBlockLevel: number,
  liquidationEndLevel: number,
  markedForLiquidationLevel: number,
  liquidationDelayInMinutes: number,
  oracleLatestPrices: Record<string, number>,
): boolean {
  const isLiquidatableByValue = isLiquidatableByRatio(
    loanOutstandingTotal,
    loanTokenOracleAddress,
    liquidationRatio,
    vaultCollateralTokens,
    oracleLatestPrices,
  )
  const isLiquidatableByConfig = checkVaultIsLiquidatable(
    currentBlockLevel,
    liquidationEndLevel,
    markedForLiquidationLevel,
    liquidationDelayInMinutes,
  )
  return isLiquidatableByValue && isLiquidatableByConfig
}

/**
 * The status flag AT RISK
 * @param loanOutstandingTotal
 * @param loanTokenOracleAddress
 * @param liquidationRatio
 * @param collateralRatio
 * @param vaultCollateralTokens
 */
export function checkIfVaultIsAtRisk(
  loanOutstandingTotal: number,
  loanTokenOracleAddress: string,
  liquidationRatio: number,
  collateralRatio: number,
  vaultCollateralTokens: any[],
  oracleLatestPrices: Record<string, number>,
): boolean {
  const vaultCollateralTokenBalances = vaultCollateralTokens.map((collateralToken: any) => {
    const oracleId = collateralToken.token.oracleId
    const collateralTokenLatestPrice = oracleLatestPrices[oracleId]
    const balanceInUSD = collateralToken.balance * collateralTokenLatestPrice

    return balanceInUSD
  })

  const totalCollateralValueInUSD = vaultCollateralTokenBalances.length
    ? vaultCollateralTokenBalances.reduce((accumulator, tokenBalance) => {
        return accumulator + tokenBalance
      })
    : 0

  const loanTokenLatestPrice = oracleLatestPrices[loanTokenOracleAddress]
  const loanOutstandingInUSD = loanOutstandingTotal * loanTokenLatestPrice

  if (totalCollateralValueInUSD === 0 && loanOutstandingInUSD > 0) {
    return true
  } else if (totalCollateralValueInUSD === 0 && loanOutstandingInUSD === 0) {
    return false
  }

  const isBelowCollateralRatio = loanOutstandingInUSD < (collateralRatio * totalCollateralValueInUSD) / 1000
  const isAboveLiquidationRatio = loanOutstandingInUSD > (liquidationRatio * loanOutstandingInUSD) / 1000
  return isBelowCollateralRatio && isAboveLiquidationRatio
}

export const calculateVaultMaxLiquidationAmount = (
  loanOutstandingTotal: number,
  maxVaultLiquidationPercent: number,
) => {
  return Math.trunc((loanOutstandingTotal * maxVaultLiquidationPercent) / 10000)
}

export const calculateAdminLiquidationFee = (adminLiquidationFeePercent: number, liquidationAmount: number) => {
  return Math.trunc((adminLiquidationFeePercent * liquidationAmount) / 10000)
}

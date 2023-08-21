import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import { getVaultBorrowCapacity, getVaultCollateralRatio } from '../helpers/vaults.utils'

export const operationBorrow = 'borrow'
export const operationRepay = 'repay'
export const operationAddCollateral = 'addCollateral'
export const operationRemoveCollateral = 'removeCollateral'

type UseVaultFutureStatsProps = {
  operationType:
    | typeof operationBorrow
    | typeof operationRepay
    | typeof operationAddCollateral
    | typeof operationRemoveCollateral
  inputValue: number
  marketAvailableLiquidity: number
  vaultCurrentTotalOutstanding: number
  vaultCurrentCollateralBalance: number
  vaultTokenAddress: TokenAddressType
  collateralTokenAddress?: TokenAddressType
}

/**
 * @param operationType - type of operation, from it will depend what values will change, and what do we need to calc
 * @param inputValue - amount in tokens, that user've entered in input
 * @param marketAvailableLiquidity - amount in tokens, how many free tokens in the market pool
 * @param vaultCurrentTotalOutstanding - amount in tokens, how much borrowed from the vault
 * @param vaultCurrentCollateralBalance - amount in USD, how much collaterals in the vault
 * @param vaultTokenAddress - address of borrowed asset
 * @param collateralTokenAddress - address of added | removed collateral, only for operationAddCollateral | operationRemoveCollateral
 *
 * @returns futureTotalOustanding -> same as vaultCurrentTotalOutstanding, but if operation with inputAmount is procceeded
 * @returns futureCollateralBalance -> same as vaultCurrentCollateralBalance, but if operation with inputAmount is procceeded
 * @returns futureBorrowCapacity -> amount to borrow from vault if operation with inputAmount is procceeded
 * @returns futureCollateralRatio -> ratio of borrowed amount to collateralBalance if operation with inputAmount is procceeded
 */
export const useVaultFutureStats = ({
  operationType,
  inputValue,
  marketAvailableLiquidity,
  vaultCurrentTotalOutstanding,
  vaultCurrentCollateralBalance,
  vaultTokenAddress,
  collateralTokenAddress,
}: UseVaultFutureStatsProps) => {
  const { tokensMetadata, tokensPrices } = useTokensContext()

  // if we pass default values, means we don't need to calcs anything
  if (collateralTokenAddress === '' || vaultTokenAddress === '')
    return {
      futureTotalOustanding: 0,
      futureCollateralRatio: 0,
      futureBorrowCapacity: 0,
      futureCollateralBalance: 0,
    }

  const borrowedToken = getTokenDataByAddress({ tokenAddress: vaultTokenAddress, tokensMetadata, tokensPrices })
  const collateralToken = getTokenDataByAddress({ tokenAddress: collateralTokenAddress, tokensMetadata, tokensPrices })

  if (!borrowedToken || !borrowedToken.rate)
    throw new Error('useVaultFutureStats error: wrong borrowed token address provided')

  const borrowedTokenRate = borrowedToken.rate
  const marketAvailableLiquidityInUSD = marketAvailableLiquidity * borrowedTokenRate

  if (operationType === operationBorrow) {
    const futureTotalOustanding = vaultCurrentTotalOutstanding + inputValue
    const futureCollateralRatio = getVaultCollateralRatio(
      vaultCurrentCollateralBalance,
      futureTotalOustanding * borrowedTokenRate,
    )
    const futureBorrowCapacity = getVaultBorrowCapacity(
      marketAvailableLiquidityInUSD - inputValue * borrowedTokenRate,
      futureTotalOustanding * borrowedTokenRate,
      vaultCurrentCollateralBalance,
    )

    return {
      futureTotalOustanding,
      futureCollateralRatio,
      futureBorrowCapacity,
      futureCollateralBalance: vaultCurrentCollateralBalance,
    }
  }

  if (operationType === operationRepay) {
    const futureTotalOustanding = vaultCurrentTotalOutstanding - inputValue
    const futureCollateralRatio = getVaultCollateralRatio(
      vaultCurrentCollateralBalance,
      futureTotalOustanding * borrowedTokenRate,
    )
    const futureBorrowCapacity = getVaultBorrowCapacity(
      marketAvailableLiquidityInUSD + inputValue * borrowedTokenRate,
      futureTotalOustanding * borrowedTokenRate,
      vaultCurrentCollateralBalance,
    )

    return {
      futureTotalOustanding,
      futureCollateralRatio,
      futureBorrowCapacity,
      futureCollateralBalance: vaultCurrentCollateralBalance,
    }
  }

  if (operationType === operationRemoveCollateral || operationType === operationAddCollateral) {
    if (!collateralToken || !collateralToken.rate)
      throw new Error('useVaultFutureStats error: wrong collateral token address provided')

    const convertedInputAmount =
      inputValue * collateralToken.rate * (operationType === operationRemoveCollateral ? -1 : 1)

    const futureCollateralBalance = vaultCurrentCollateralBalance + convertedInputAmount

    const futureCollateralRatio = getVaultCollateralRatio(
      futureCollateralBalance,
      vaultCurrentTotalOutstanding * borrowedTokenRate,
    )
    const futureBorrowCapacity = getVaultBorrowCapacity(
      marketAvailableLiquidityInUSD,
      vaultCurrentTotalOutstanding * borrowedTokenRate,
      futureCollateralBalance,
    )

    return {
      futureTotalOustanding: vaultCurrentTotalOutstanding,
      futureCollateralRatio,
      futureBorrowCapacity,
      futureCollateralBalance,
    }
  }

  throw new Error('useVaultFutureStats error: wrong operationType passed')
}

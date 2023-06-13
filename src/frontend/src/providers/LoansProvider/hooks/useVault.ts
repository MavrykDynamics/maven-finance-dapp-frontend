import { getVaultCollateralBalance } from 'pages/Vaults/Vaults.helpers'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { LoansVaultType } from 'utils/TypesAndInterfaces/Loans'
import { convertNumberForClient } from 'utils/calcFunctions'
import { getCollateralRatio, getVaultBorrowCapacity, getVaultStatus } from '../helpers/vaults.utils'
import { FullLoansVaultType } from '../helpers/vaults.types'

// TODO: add status and liquidation stuff
const useVault = (vault: LoansVaultType): FullLoansVaultType => {
  const { tokensMetadata, tokensPrices } = useTokensContext()

  const { borrowedAmount, collateralData, fee, availableLiquidity } = vault

  const borrowedToken = tokensMetadata[vault.borrowedTokenAddress]
  const { symbol, decimals } = borrowedToken
  const rate = tokensPrices[symbol]

  const convertedBorrowedAmount = convertNumberForClient({ number: borrowedAmount, grade: decimals }),
    convertedFee = convertNumberForClient({ number: fee, grade: decimals }),
    collateralBalance = getVaultCollateralBalance(collateralData, tokensMetadata, tokensPrices),
    collateralRatio = getCollateralRatio(collateralBalance, convertedBorrowedAmount, rate),
    borrowCapacity = getVaultBorrowCapacity({
      availableLiquidity,
      collateralBalance,
      borrowedAmount,
      borrowedTokenRate: rate,
      borrowedTokenDecimals: decimals,
    }),
    status = getVaultStatus()

  return {
    ...vault,
    borrowedAmount: convertedBorrowedAmount,
    fee: convertedFee,
    totalOutstanding: convertedFee + convertedBorrowedAmount,
    collateralBalance,
    borrowCapacity,
    collateralRatio,
    borrowedTokenMetadata: borrowedToken,
    borrowedTokenRate: rate,
    status,
  }
}

export default useVault

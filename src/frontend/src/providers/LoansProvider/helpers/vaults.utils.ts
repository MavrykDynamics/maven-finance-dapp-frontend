import { LoansVaultType } from 'utils/TypesAndInterfaces/Loans'
import { convertNumberForClient, getNumberInBounds } from 'utils/calcFunctions'

export const getVaultStatus = () => {
  return ''
}

export const getVaultBorrowCapacity = ({
  availableLiquidity,
  collateralBalance,
  borrowedAmount,
  borrowedTokenRate,
  borrowedTokenDecimals,
}: {
  availableLiquidity: number
  collateralBalance: number
  borrowedAmount: number
  borrowedTokenRate: number
  borrowedTokenDecimals: number
}) => {
  const convertedLiq = convertNumberForClient({ number: availableLiquidity, grade: borrowedTokenDecimals }),
    convertedBorrowedAmount = convertNumberForClient({ number: borrowedAmount, grade: borrowedTokenDecimals })

  return Math.min(
    collateralBalance / 2 - convertedBorrowedAmount * borrowedTokenRate,
    Math.max(convertedLiq * borrowedTokenRate, 0),
  )
}

export const getCollateralRatio = (collateralAmount: number, borrowedAmount: number, borrowedAssetRate: number) => {
  // means we haven't borrowed anything
  if (collateralAmount === 0) return 0

  // means we haven't borrowed, but we have deposited
  if (borrowedAmount === 0) return 250

  const collateralRatio = (collateralAmount / Math.max(1, borrowedAmount * borrowedAssetRate)) * 100
  return getNumberInBounds(0, 250, Number(collateralRatio.toFixed(1)))
}

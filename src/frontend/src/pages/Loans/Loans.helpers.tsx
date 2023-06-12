import { UserState } from 'reducers/wallet'
import { LendingItemType } from 'utils/TypesAndInterfaces/Loans'

import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'

import { convertNumberForClient, convertNumberForContractCall, getNumberInBounds } from '../../utils/calcFunctions'
import { assetDecimalsToShow } from './Loans.const'

// GET ASSET METADATA
export const isTezosAsset = (tokenName: string) =>
  tokenName.toLowerCase() === 'tez' || tokenName.toLowerCase() === 'tezos' || tokenName.toLowerCase() === 'xtz'

// HELPER FOR LENDING APY
export const calcLendingAPY = (currentInterestRate: number, treasuryShare: number): number => {
  const secondsPerYear = 60 * 60 * 24 * 365

  const top = currentInterestRate - treasuryShare
  const firstTerm = 1 + top / secondsPerYear
  const power = firstTerm ** secondsPerYear
  return (power - 1) * 100
}

// HELPER FOR BORROW FEE
export const calculateAccruedInterest = (
  currentLoanOutstandingTotal: number,
  vaultBorrowIndex: number,
  tokenBorrowIndex: number,
) => {
  let newLoanOutstandingTotal = currentLoanOutstandingTotal
  const vBorrowIndex = vaultBorrowIndex
  const loanTokenBorrowIndex = tokenBorrowIndex

  if (currentLoanOutstandingTotal > 0) {
    if (vBorrowIndex > 0) {
      newLoanOutstandingTotal = Math.trunc((currentLoanOutstandingTotal * loanTokenBorrowIndex) / vBorrowIndex)
    }
  }

  return newLoanOutstandingTotal
}

// HELPER FOR COLLATERAL RATIO
export const calcCollateralRatio = (collateralAmount: number, borrowedAmount: number, borrowedAssetRate: number) => {
  // means we haven't borrowed anything
  if (collateralAmount === 0) return 0

  // means we haven't borrowed, but we have deposited
  if (borrowedAmount === 0) return 250

  const collateralRatio = (collateralAmount / Math.max(1, borrowedAmount * borrowedAssetRate)) * 100
  return getNumberInBounds(0, 250, Number(collateralRatio.toFixed(1)))
}

// HELPER FOR MAX COLLATERAL WITHDRAW
export const getMaxCollateralWithdraw = (
  currentCollateralAmount: number,
  totalCollateralAmount: number,
  borrowedAmount: number,
  borrowedAssetRate: number,
  collarealAssetRate: number,
): number => {
  // If vault is not borrowed we can withdraw all amount
  if (borrowedAmount === 0) return currentCollateralAmount
  /**
   * @collateralNeedsToBe is now much collateralAmount i need to left for current borrowed amount
   * 200 ratio in persent the smallest we can get, <200 vault is under collateralization
   * 100 is to transform % => number
   * (borrowedAmount * borrowedAssetRate) how much has been borrowed from the vault
   */
  const collateralNeedsToBe = (200 / 100) * (borrowedAmount * borrowedAssetRate)
  return Math.min((totalCollateralAmount - collateralNeedsToBe) / collarealAssetRate, currentCollateralAmount)
}

// VALIDATE LEND/BORROW POPUPS HELPERS
export const loansInputValidation = ({
  inputAmount,
  minAmount = 0,
  maxAmount,
  options = {},
}: {
  inputAmount: string
  minAmount?: number
  maxAmount: number
  options?: {
    byDecimalPlaces?: number
  }
}) => {
  const { byDecimalPlaces } = options
  const numberOfDecimalPlaces = inputAmount.match(/\.(\d+)/)?.[1].length ?? 0

  // check amount by min/max value
  if (Number(inputAmount) > minAmount && Number(inputAmount) <= maxAmount) {
    // check amount by number of decimal places
    if (byDecimalPlaces) {
      return numberOfDecimalPlaces <= byDecimalPlaces ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR
    }

    return INPUT_STATUS_SUCCESS
  }

  return INPUT_STATUS_ERROR
}

// use for get max amount for input field
// using an amount without this function will result in a validation error,
// as input is validated by the number of decimal places, and the value
// without processing may be greater
export const getLoansInputMaxAmount = (amount: number = 0, decimals: number = assetDecimalsToShow) => {
  if (!amount) return '0'

  const blockchainNumberWithoutDecimals = Math.trunc(convertNumberForContractCall({ number: amount, grade: decimals }))

  return String(convertNumberForClient({ number: blockchainNumberWithoutDecimals, grade: decimals }))
}

/**
 * @param collateralRatio is a number from 0 to 250. Which usually used to display collateral ratio in persentage
 * @returns number from 1 to 100. Use this result for currentPersentage prop into GradientDiagram component
 */
export const getCollateralRatioByPersentage = (collateralRatio: number) => {
  return Math.max(0, Math.min(((collateralRatio - 100) / 150) * 100, 100))
}

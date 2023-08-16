import { AreaChartPlotType } from 'app/App.components/Chart/helpers/Chart.types'

import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'

import { convertNumberForClient, convertNumberForContractCall } from '../../utils/calcFunctions'
import { assetDecimalsToShow } from './Loans.const'
import { SingleValueData } from 'lightweight-charts'

/**
 * calculate accurred interest for vault
 * @param currentLoanOutstandingTotal – TODO: add descr
 * @param borrowedAmount – pure amount how much is borrowed in the vault
 * @param vaultBorrowIndex - TODO: add descr
 * @param marketBorrowIndex - TODO: add descr
 * @returns interest for borrowed amount
 */
export const calculateTotalOutstanding = ({
  currentLoanOutstandingTotal,
  vaultBorrowIndex,
  marketBorrowIndex,
}: {
  currentLoanOutstandingTotal: number
  vaultBorrowIndex: number
  marketBorrowIndex: number
}) => {
  if (currentLoanOutstandingTotal > 0 && vaultBorrowIndex > 0) {
    return (currentLoanOutstandingTotal * marketBorrowIndex) / vaultBorrowIndex
  }

  return currentLoanOutstandingTotal
}

/**
 * calculate accurred interest for vault
 * @param currentLoanOutstandingTotal – TODO: add descr
 * @param borrowedAmount – pure amount how much is borrowed in the vault
 * @param vaultBorrowIndex - TODO: add descr
 * @param marketBorrowIndex - TODO: add descr
 * @returns interest for borrowed amount
 */
export const calculateAccruedInterest = ({
  currentLoanOutstandingTotal,
  borrowedAmount,
  vaultBorrowIndex,
  marketBorrowIndex,
}: {
  currentLoanOutstandingTotal: number
  borrowedAmount: number
  vaultBorrowIndex: number
  marketBorrowIndex: number
}) => {
  if (currentLoanOutstandingTotal > 0 && vaultBorrowIndex > 0) {
    return Math.abs(
      calculateTotalOutstanding({ currentLoanOutstandingTotal, marketBorrowIndex, vaultBorrowIndex }) - borrowedAmount,
    )
  }

  return Math.abs(currentLoanOutstandingTotal - borrowedAmount)
}

/**
 * calculate accurred interest for vault
 * @param borrowCapacity – how much user can borrow (borrowed amount + interest)
 * @param vaultBorrowIndex - TODO: add descr
 * @param marketBorrowIndex - TODO: add descr
 * @returns pure amount how much user can borrow
 */
export const getMaxBorrowAmountFromBorrowCapacity = ({
  borrowCapacity,
  vaultBorrowIndex,
  marketBorrowIndex,
}: {
  borrowCapacity: number
  vaultBorrowIndex: number
  marketBorrowIndex: number
}) => {
  if (borrowCapacity > 0 && vaultBorrowIndex > 0) {
    console.log({
      borrowCapacity,
      returnborrowCapacity: (borrowCapacity / marketBorrowIndex) * vaultBorrowIndex,
      marketBorrowIndex,
      vaultBorrowIndex,
    })
    return (borrowCapacity / marketBorrowIndex) * vaultBorrowIndex
  }

  return borrowCapacity
}

// HELPER FOR MAX COLLATERAL WITHDRAW
export const getMaxCollateralWithdraw = (
  totalCollateralAmount: number,
  borrowedAmount: number,
  collarealAssetRate: number,
): number => {
  // If vault is not borrowed we can withdraw all amount
  if (borrowedAmount === 0) return totalCollateralAmount

  if (collarealAssetRate === 0) throw new Error('token rate is 0')

  /**
   * @collateralNeedsToBe is now much collateralAmount i need to left for current borrowed amount
   * 200 ratio in persent the smallest we can get, <200 vault is under collateralization
   * 100 is to transform % => number
   * (borrowedAmount * borrowedAssetRate) how much has been borrowed from the vault
   */
  const collateralNeedsToBe = (200 / 100) * borrowedAmount

  return (totalCollateralAmount - collateralNeedsToBe) / collarealAssetRate
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

/**
 * get data with 0 value within 7 days (as this is the period on the chart). Is need instead of plug for empty chart.
 * @param chartData - data of chart
 * @param period - the number of days to display 0 if the chart is empty
 */
export const getChartDataBasedOnLength = (chartData: AreaChartPlotType[], period: number) => {
  const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000

  const lastValue = (chartData.at(-1) as SingleValueData)?.value ?? 0

  const itemsToAdd = Array.from({ length: period - chartData.length }, (_, index) => ({
    time: new Date().getTime() - ONE_DAY_IN_MS * (period - chartData.length - index - 1),
    value: lastValue,
  })) as AreaChartPlotType[]

  const emptyChartData = chartData.concat(itemsToAdd)

  return chartData.length >= period ? chartData : emptyChartData
}

/**
 * get current settings if the chart is not empty, or custom settings with small chart height for empty chart.
 * Need a small height because the empty chart with standard settings has a bad look in the center of the container.
 * @param chartData - data of chart
 * @param settings - settings of chart
 * @returns
 */
export const getChartSettingsBasedOnChartLength = (
  chartData: AreaChartPlotType[],
  settings: {
    width: number
    height: number
    hideXAxis: boolean
    hideYAxis: boolean
  },
) => {
  return chartData.length !== 0
    ? settings
    : {
        ...settings,
        height: 50,
      }
}

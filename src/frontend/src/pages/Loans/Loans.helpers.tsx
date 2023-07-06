import { AreaChartPlotType } from 'app/App.components/Chart/helpers/Chart.types'

import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'

import { convertNumberForClient, convertNumberForContractCall } from '../../utils/calcFunctions'
import { assetDecimalsToShow } from './Loans.const'
import { compareDatesByDay } from 'utils/compareDatesByDay'
import { SingleValueData, UTCTimestamp } from 'lightweight-charts'

// TODO: move this utils to provider and add docs to them while loans live update
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
      newLoanOutstandingTotal = (currentLoanOutstandingTotal * loanTokenBorrowIndex) / vBorrowIndex
    }
  }

  return newLoanOutstandingTotal
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

/**
 * get data with 0 value within 7 days (as this is the period on the chart). Is need instead of plug for empty chart.
 * @param chartData - data of chart
 * @param period - the number of days to display 0 if the chart is empty
 */
export const getChartDataBasedOnLength = (chartData: AreaChartPlotType[], period: number) => {
  const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000

  const emptyChartData = Array.apply(null, Array(period)).map((item, index, array) => ({
    // get 0 value for each day in period
    time: new Date().getTime() - ONE_DAY_IN_MS * (array.length - index - 1),
    value: 0,
  })) as AreaChartPlotType[]

  return chartData.length !== 0 ? chartData : emptyChartData
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

/**
 * @param array - chart data with value and time
 * @param period - 0 values for days without data will be added for this period
 * @returns {SingleValueData[]}
 */
export const addMissingDaysWithZeroValues = (array: SingleValueData[], period: number) => {
  const reversedArray = [...array].reverse()
  const updatedArray: SingleValueData[] = []
  const currentDay = new Date()
  // we use "+1" below, because it will count the period without taking into account the current day that we want to include
  currentDay.setDate(currentDay.getDate() + 1 - period)

  while (currentDay <= new Date()) {
    const foundDay = reversedArray.find(
      (item) => compareDatesByDay(currentDay, new Date(item.time as unknown as Date)) === 0,
    )

    updatedArray.push(
      foundDay
        ? foundDay
        : {
            time: currentDay.getTime() as UTCTimestamp,
            value: 0,
          },
    )

    currentDay.setDate(currentDay.getDate() + 1)
  }

  return updatedArray
}

import dayjs from 'dayjs'
import { SingleValueData, UTCTimestamp } from 'lightweight-charts'

// types
import { GetLoansHistoryDataSubscription } from 'utils/__generated__/graphql'
import { LoansChartsType, UseLoansChartsStateType } from './loans.types'
import { TokensContext } from 'providers/TokensProvider/tokens.provider.types'

// utils
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'

// consts
import {
  BORROWING_HISTORY_DATA_TYPES,
  COLLATERAL_HISTORY_DATA_TYPES,
  LIQUIDITY_HISTORY_DATA_TYPES,
  LOANS_HISTORY_DATA_TYPES,
  ONE_DAY_IN_MS,
} from './loans.const'

const getLiquidityAmount = (
  type: (typeof LOANS_HISTORY_DATA_TYPES)[keyof typeof LOANS_HISTORY_DATA_TYPES],
  usdAmount: number,
) => {
  if (type === LOANS_HISTORY_DATA_TYPES.removeLiquidity) return -usdAmount

  return usdAmount
}

const getBorrowedAmount = (
  type: (typeof LOANS_HISTORY_DATA_TYPES)[keyof typeof LOANS_HISTORY_DATA_TYPES],
  usdAmount: number,
) => {
  if (type === LOANS_HISTORY_DATA_TYPES.repay) return -usdAmount

  return usdAmount
}

const getCollateralAmount = (
  type: (typeof LOANS_HISTORY_DATA_TYPES)[keyof typeof LOANS_HISTORY_DATA_TYPES],
  usdAmount: number,
) => {
  if (
    type === LOANS_HISTORY_DATA_TYPES.withdrawCollateral ||
    type === LOANS_HISTORY_DATA_TYPES.withdrawStakedCollateral
  )
    return -usdAmount

  return usdAmount
}

const initChartDataForPeriod = (period: number) =>
  Array.from(
    {
      length: period,
    },
    (_, idx) => {
      return {
        value: 0,
        time: dayjs()
          .subtract(6 - idx, 'day')
          .valueOf() as UTCTimestamp,
      }
    },
  )

// if operation in period, update subperiod where time >= operation time
const getChartWithOperationInPeriod = ({
  chartData,
  operationValue,
  operationTime,
}: {
  chartData: Array<SingleValueData>
  operationValue: number
  operationTime: number
}): Array<SingleValueData> | null => {
  // find day that matches operation time
  const operationDayIdx = chartData.findIndex(({ time }) => {
    const dayStart = dayjs(Number(time)).hour(0).minute(0).second(0).millisecond(0).valueOf()
    const dayEnd = dayjs(Number(time)).hour(23).minute(59).second(59).millisecond(999).valueOf()

    return Number(operationTime) <= dayEnd && Number(operationTime) >= dayStart
  })

  // if we have day in period, that === operation day, update values to be sum of operation value and day value
  if (operationDayIdx) {
    return chartData.reduce((acc, { value, time }, idx) => {
      if (idx >= operationDayIdx) {
        acc[idx] = {
          value: value + operationValue,
          time,
        }
      }

      return acc
    }, chartData)
  }
  return null
}

const getChartWithOperationOutOfPeriod = ({
  chartData,
  operationValue,
}: {
  chartData: Array<SingleValueData>
  operationValue: number
}): Array<SingleValueData> =>
  (chartData = chartData.map(({ time, value }) => ({
    value: value + operationValue,
    time,
  })))

export const normalizeLoansCharts = ({
  indexerData,
  chartsToCalc,
  tokensMetadata,
  tokensPrices,
}: {
  indexerData: GetLoansHistoryDataSubscription
  chartsToCalc: LoansChartsType
  tokensPrices: TokensContext['tokensPrices']
  tokensMetadata: TokensContext['tokensMetadata']
}) => {
  const {
    calcTotalLendingChart = false,
    calcTotalBorrowingChart = false,
    calcTotalCollateralChart = false,
    calcMarketBorrowChart = false,
    calcMarketLendingChart = false,
  } = chartsToCalc

  return indexerData.lending_controller[0].history_data.reduce<UseLoansChartsStateType>(
    (acc, { type, amount, timestamp, loan_token, collateral_token }) => {
      if (!loan_token) return acc
      const loanTokenAddress = loan_token.token.token_address
      const collateralTokenAddress = collateral_token?.token.token_address

      // tokenAddress = collateralTokenAddress if it's collateral operation, othervise use loan token address
      const tokenAddress =
        COLLATERAL_HISTORY_DATA_TYPES.includes(type) && collateralTokenAddress
          ? collateralTokenAddress
          : loanTokenAddress

      const token = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
      if (!token || !token.rate) return acc

      const { decimals, rate } = token

      const convertedAmount = convertNumberForClient({ number: amount, grade: decimals })
      const amountInUsd = convertedAmount * rate

      const isLast7dOperation = dayjs().diff(timestamp) <= ONE_DAY_IN_MS * 6
      const isLast14dOperation = dayjs().diff(timestamp) <= ONE_DAY_IN_MS * 14
      const operationTime = dayjs(timestamp).valueOf() as UTCTimestamp

      // getting data for total lending chart
      if (calcTotalLendingChart && LIQUIDITY_HISTORY_DATA_TYPES.includes(type)) {
        // if it's out of the period need to sum this value with values of every day, cuz init value for period is > 0
        if (!isLast7dOperation) {
          acc.totalLendingChart = getChartWithOperationOutOfPeriod({
            chartData: acc.totalLendingChart,
            operationValue: getLiquidityAmount(type, amountInUsd),
          })
        } else {
          const updatedChartWithOperation = getChartWithOperationInPeriod({
            chartData: acc.totalLendingChart,
            operationTime: Number(operationTime),
            operationValue: getLiquidityAmount(type, amountInUsd),
          })

          if (updatedChartWithOperation) acc.totalLendingChart = updatedChartWithOperation
        }
      }

      // getting data for total lending chart per markets
      if (calcMarketLendingChart && LIQUIDITY_HISTORY_DATA_TYPES.includes(type)) {
        if (!acc.marketLendingChart[tokenAddress]) {
          acc.marketLendingChart[tokenAddress] = initChartDataForPeriod(14)
        }

        // if it's out of the period need to sum this value with values of every day, cuz init value for period is > 0
        if (!isLast14dOperation) {
          acc.marketLendingChart[tokenAddress] = getChartWithOperationOutOfPeriod({
            chartData: acc.marketLendingChart[tokenAddress],
            operationValue: getLiquidityAmount(type, amountInUsd),
          })
        } else {
          const updatedChartWithOperation = getChartWithOperationInPeriod({
            chartData: acc.marketLendingChart[tokenAddress],
            operationTime: Number(operationTime),
            operationValue: getLiquidityAmount(type, amountInUsd),
          })

          if (updatedChartWithOperation) acc.marketLendingChart[tokenAddress] = updatedChartWithOperation
        }
      }

      // getting data for total borrowing chart
      if (calcTotalBorrowingChart && BORROWING_HISTORY_DATA_TYPES.includes(type)) {
        // if it's out of the period need to sum this value with values of every day, cuz init value for period is > 0
        if (!isLast7dOperation) {
          acc.totalBorrowingChart = getChartWithOperationOutOfPeriod({
            chartData: acc.totalBorrowingChart,
            operationValue: getBorrowedAmount(type, amountInUsd),
          })
        } else {
          const updatedChartWithOperation = getChartWithOperationInPeriod({
            chartData: acc.totalBorrowingChart,
            operationTime: Number(operationTime),
            operationValue: getBorrowedAmount(type, amountInUsd),
          })

          if (updatedChartWithOperation) acc.totalBorrowingChart = updatedChartWithOperation
        }
      }

      // getting data for total borrowed chart per markets
      if (calcMarketBorrowChart && BORROWING_HISTORY_DATA_TYPES.includes(type)) {
        if (!acc.marketBorrowChart[tokenAddress]) {
          acc.marketBorrowChart[tokenAddress] = initChartDataForPeriod(14)
        }

        // if it's out of the period need to sum this value with values of every day, cuz init value for period is > 0
        if (!isLast14dOperation) {
          acc.marketBorrowChart[tokenAddress] = getChartWithOperationOutOfPeriod({
            chartData: acc.marketBorrowChart[tokenAddress],
            operationValue: getBorrowedAmount(type, amountInUsd),
          })
        } else {
          const updatedChartWithOperation = getChartWithOperationInPeriod({
            chartData: acc.marketBorrowChart[tokenAddress],
            operationTime: Number(operationTime),
            operationValue: getBorrowedAmount(type, amountInUsd),
          })

          if (updatedChartWithOperation) acc.marketBorrowChart[tokenAddress] = updatedChartWithOperation
        }
      }

      // getting data for total collaterals chart
      if (calcTotalCollateralChart && COLLATERAL_HISTORY_DATA_TYPES.includes(type)) {
        // if it's out of the period need to sum this value with values of every day, cuz init value for period is > 0
        if (!isLast7dOperation) {
          acc.totalCollateralChart = getChartWithOperationOutOfPeriod({
            chartData: acc.totalCollateralChart,
            operationValue: getCollateralAmount(type, amountInUsd),
          })
        } else {
          const updatedChartWithOperation = getChartWithOperationInPeriod({
            chartData: acc.totalCollateralChart,
            operationTime: Number(operationTime),
            operationValue: getCollateralAmount(type, amountInUsd),
          })

          if (updatedChartWithOperation) acc.totalCollateralChart = updatedChartWithOperation
        }
      }

      return acc
    },
    {
      totalLendingChart: initChartDataForPeriod(7),
      totalBorrowingChart: initChartDataForPeriod(7),
      totalCollateralChart: initChartDataForPeriod(7),
      marketBorrowChart: {},
      marketLendingChart: {},
    },
  )
}

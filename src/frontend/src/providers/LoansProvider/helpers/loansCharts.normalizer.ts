import dayjs from 'dayjs'
import { SingleValueData, UTCTimestamp } from 'lightweight-charts'

// types
import { GetLoansHistoryDataQuery } from 'utils/__generated__/graphql'
import { TokensContext } from 'providers/TokensProvider/tokens.provider.types'

// utils
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import { getDateStart, getDateEnd, checkWhetherTimeIsLastNdays } from 'utils/time'

// consts
import {
  BORROWING_HISTORY_DATA_TYPES,
  COLLATERAL_HISTORY_DATA_TYPES,
  LIQUIDITY_HISTORY_DATA_TYPES,
  LOANS_HISTORY_DATA_TYPES,
} from './loans.const'
import { LoansChartsToCalcType } from '../hooks/useLoansCharts'
import { LoansChartsType } from '../loans.provider.types'

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
          .subtract(period - 1 - idx, 'day')
          .valueOf() as UTCTimestamp,
      }
    },
  )

// if operation in period, update subperiod where time >= operation time
const getChartWithOperationInPeriod = ({
  chartData,
  operationValue,
  operationTime,
  isVolume = false,
}: {
  chartData: Array<SingleValueData>
  operationValue: number
  operationTime: number
  isVolume?: boolean
}): Array<SingleValueData> | null => {
  // find day that matches operation time
  const operationDayIdx = chartData.findIndex(({ time }) => {
    const dayStart = getDateStart(Number(time)),
      dayEnd = getDateEnd(Number(time))

    return Number(operationTime) <= dayEnd && Number(operationTime) >= dayStart
  })

  // if we have day in period, that === operation day, update values to be sum of operation value and day value
  if (operationDayIdx) {
    return chartData.reduce((acc, { value, time }, idx) => {
      if (isVolume ? idx === operationDayIdx : idx >= operationDayIdx) {
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

// if operation is out of period, update all days to be initial value of prev initialValue + operation amount
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

// normalize charts, calc only charts we passed
export const normalizeLoansCharts = ({
  indexerData,
  chartsToCalc,
  tokensMetadata,
  tokensPrices,
}: {
  indexerData: GetLoansHistoryDataQuery
  chartsToCalc: LoansChartsToCalcType
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

  return indexerData.lending_controller[0].history_data.reduce<LoansChartsType>(
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

      const isLast7dOperation = checkWhetherTimeIsLastNdays(timestamp, 7)
      const isLast14dOperation = checkWhetherTimeIsLastNdays(timestamp, 14)
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
          acc.marketLendingChart[tokenAddress] = {
            total: initChartDataForPeriod(14),
            volume: initChartDataForPeriod(14),
          }
        }

        // if it's out of the period need to sum this value with values of every day, cuz init value for period is > 0
        if (!isLast14dOperation) {
          acc.marketLendingChart[tokenAddress].total = getChartWithOperationOutOfPeriod({
            chartData: acc.marketLendingChart[tokenAddress].total,
            operationValue: getLiquidityAmount(type, amountInUsd),
          })
        } else {
          const updatedTotalChartWithOperation = getChartWithOperationInPeriod({
            chartData: acc.marketLendingChart[tokenAddress].total,
            operationTime: Number(operationTime),
            operationValue: getLiquidityAmount(type, amountInUsd),
          })

          const updatedVolumeChartWithOperation = getChartWithOperationInPeriod({
            chartData: acc.marketLendingChart[tokenAddress].volume,
            operationTime: Number(operationTime),
            operationValue: getLiquidityAmount(type, amountInUsd),
            isVolume: true,
          })

          if (updatedTotalChartWithOperation)
            acc.marketLendingChart[tokenAddress].total = updatedTotalChartWithOperation
          if (updatedVolumeChartWithOperation)
            acc.marketLendingChart[tokenAddress].volume = updatedVolumeChartWithOperation
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
          acc.marketBorrowChart[tokenAddress] = {
            total: initChartDataForPeriod(14),
            volume: initChartDataForPeriod(14),
          }
        }

        // if it's out of the period need to sum this value with values of every day, cuz init value for period is > 0
        if (!isLast14dOperation) {
          acc.marketBorrowChart[tokenAddress].total = getChartWithOperationOutOfPeriod({
            chartData: acc.marketBorrowChart[tokenAddress].total,
            operationValue: getBorrowedAmount(type, amountInUsd),
          })
        } else {
          const updatedTotalChartWithOperation = getChartWithOperationInPeriod({
            chartData: acc.marketBorrowChart[tokenAddress].total,
            operationTime: Number(operationTime),
            operationValue: getBorrowedAmount(type, amountInUsd),
          })

          const updatedVolumeChartWithOperation = getChartWithOperationInPeriod({
            chartData: acc.marketBorrowChart[tokenAddress].volume,
            operationTime: Number(operationTime),
            operationValue: getBorrowedAmount(type, amountInUsd),
            isVolume: true,
          })

          if (updatedTotalChartWithOperation) acc.marketBorrowChart[tokenAddress].total = updatedTotalChartWithOperation
          if (updatedVolumeChartWithOperation)
            acc.marketBorrowChart[tokenAddress].volume = updatedVolumeChartWithOperation
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

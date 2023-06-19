import { useState } from 'react'
import dayjs from 'dayjs'
import { useSubscription } from '@apollo/client'
import { UTCTimestamp } from 'lightweight-charts'

// provider
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// types
import { LoansChartsType, UseLoansChartsStateType } from '../helpers/loans.types'

// consts & helpers
import { COLLATERAL_HISTORY_DATA_TYPES, DEFAULT_LOANS_CHARTS_STATE, ONE_DAY_IN_MS } from '../helpers/loans.const'
import { GET_LOANS_HISTORY_DATA } from 'providers/LoansProvider/queries/loansHistory.query'
import { convertNumberForClient } from 'utils/calcFunctions'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

/**
 *
 * @param param0 – flags object that specify data for what chart types we need
 * @param param0.calcTotalLendingChart – calc data for total lending chart
 * @param param0.calcTotalBorrowingChart – calc data for total borrowing chart
 * @param param0.calcTotalCollateralChart – calc data for total collaterals chart
 * @param param0.calcMarketCollateralChart – calc data for collaterals per market chart
 * @param param0.calcMarketLendingChart – calc data for lending per market chart
 */
const useLoansCharts = ({
  calcTotalLendingChart = false,
  calcTotalBorrowingChart = false,
  calcTotalCollateralChart = false,
  calcMarketCollateralChart = false,
  calcMarketLendingChart = false,
}: LoansChartsType) => {
  const { tokensMetadata, tokensPrices } = useTokensContext()

  const [chartsData, setChartsData] = useState<UseLoansChartsStateType>(DEFAULT_LOANS_CHARTS_STATE)

  const { loading } = useSubscription(GET_LOANS_HISTORY_DATA, {
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      if (!data) return

      const newChartsData = data.lending_controller[0].history_data.reduce<UseLoansChartsStateType>(
        (acc, { type, amount, timestamp, loan_token, collateral_token }) => {
          if (!loan_token) return acc
          const loanTokenAddress = loan_token.token.token_address
          const collateralTokenAddress = collateral_token?.token.token_address

          const tokenAddress =
            COLLATERAL_HISTORY_DATA_TYPES.includes(type) && collateralTokenAddress
              ? collateralTokenAddress
              : loanTokenAddress

          const token = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
          if (!token || !token.rate) return acc

          const { decimals, rate } = token

          const convertedAmount = convertNumberForClient({ number: amount, grade: decimals })
          const amountInUsd = convertedAmount * rate

          const isLast7dOperation = dayjs().diff(timestamp) <= ONE_DAY_IN_MS * 7

          const operationTime = new Date(timestamp).getTime() as UTCTimestamp

          // add liquidity operation
          if (type === 0 && calcTotalLendingChart && isLast7dOperation) {
            acc.totalLendingChart.push({
              value: (acc.totalLendingChart.at(-1)?.value ?? 0) + amountInUsd,
              time: operationTime,
            })
          }

          if (type === 0 && calcMarketLendingChart) {
            if (!acc.marketLendingChart[tokenAddress]) {
              acc.marketLendingChart[tokenAddress] = [
                {
                  value: amountInUsd,
                  time: operationTime,
                },
              ]
            } else {
              acc.marketLendingChart[tokenAddress].push({
                value: (acc.marketLendingChart[tokenAddress].at(-1)?.value ?? 0) + amountInUsd,
                time: operationTime,
              })
            }
          }

          // remove liquidity operation
          if (type === 1 && calcTotalLendingChart && isLast7dOperation) {
            acc.totalLendingChart.push({
              value: (acc.totalLendingChart.at(-1)?.value ?? 0) - amountInUsd,
              time: operationTime,
            })
          }

          if (type === 1 && calcMarketLendingChart) {
            if (!acc.marketLendingChart[tokenAddress]) {
              acc.marketLendingChart[tokenAddress] = [
                {
                  value: -amountInUsd,
                  time: operationTime,
                },
              ]
            } else {
              acc.marketLendingChart[tokenAddress].push({
                value: (acc.marketLendingChart[tokenAddress].at(-1)?.value ?? 0) - amountInUsd,
                time: operationTime,
              })
            }
          }

          // borrow operation
          if (type === 2 && calcTotalBorrowingChart && isLast7dOperation) {
            acc.totalBorrowingChart.push({
              value: (acc.totalLendingChart.at(-1)?.value ?? 0) + amountInUsd,
              time: operationTime,
            })
          }

          // repay operation
          if (type === 3 && calcTotalBorrowingChart && isLast7dOperation) {
            acc.totalBorrowingChart.push({
              value: (acc.totalLendingChart.at(-1)?.value ?? 0) - amountInUsd,
              time: operationTime,
            })
          }

          // deposit collateral operation
          if (type === 4 && calcTotalCollateralChart && isLast7dOperation) {
            acc.totalCollateralChart.push({
              value: (acc.totalLendingChart.at(-1)?.value ?? 0) + amountInUsd,
              time: operationTime,
            })
          }

          if (type === 4 && calcMarketCollateralChart) {
            if (!acc.marketCollateralChart[tokenAddress]) {
              acc.marketCollateralChart[tokenAddress] = [
                {
                  value: amountInUsd,
                  time: operationTime,
                },
              ]
            } else {
              acc.marketCollateralChart[tokenAddress].push({
                value: (acc.marketCollateralChart[tokenAddress].at(-1)?.value ?? 0) + amountInUsd,
                time: operationTime,
              })
            }
          }

          // withdraw collateral operation
          if (type === 5 && calcTotalCollateralChart && isLast7dOperation) {
            acc.totalCollateralChart.push({
              value: (acc.totalLendingChart.at(-1)?.value ?? 0) - amountInUsd,
              time: operationTime,
            })
          }

          if (type === 5 && calcMarketCollateralChart) {
            acc.marketCollateralChart[tokenAddress].push({
              value: (acc.marketCollateralChart[tokenAddress].at(-1)?.value ?? 0) - amountInUsd,
              time: operationTime,
            })
          }

          // deposit sMVK collateral operation TODO: check rate find for sMVK
          if (type === 6 && calcTotalCollateralChart && isLast7dOperation) {
            acc.totalCollateralChart.push({
              value: (acc.totalLendingChart.at(-1)?.value ?? 0) + amountInUsd,
              time: operationTime,
            })
          }

          if (type === 6 && calcMarketCollateralChart) {
            if (!acc.marketCollateralChart[tokenAddress]) {
              acc.marketCollateralChart[tokenAddress] = [
                {
                  value: +amountInUsd,
                  time: operationTime,
                },
              ]
            } else {
              acc.marketCollateralChart[tokenAddress].push({
                value: (acc.marketCollateralChart[tokenAddress].at(-1)?.value ?? 0) + amountInUsd,
                time: operationTime,
              })
            }
          }

          // withdraw sMVK collateral operation TODO: check rate find for sMVK
          if (type === 7 && calcTotalCollateralChart && isLast7dOperation) {
            acc.totalCollateralChart.push({
              value: (acc.totalLendingChart.at(-1)?.value ?? 0) - amountInUsd,
              time: operationTime,
            })
          }

          if (type === 6 && calcMarketCollateralChart) {
            acc.marketCollateralChart[tokenAddress].push({
              value: (acc.marketCollateralChart[tokenAddress].at(-1)?.value ?? 0) - amountInUsd,
              time: operationTime,
            })
          }

          return acc
        },
        DEFAULT_LOANS_CHARTS_STATE,
      )

      setChartsData(newChartsData)
    },
    onError: (error) => {
      console.error('GET_LOANS_HISTORY_DATA error: ', { error })
    },
  })

  return { isLoading: loading, chartsData }
}

export default useLoansCharts

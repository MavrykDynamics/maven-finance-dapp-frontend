import { useEffect, useState } from 'react'
import { useSubscription } from '@apollo/client'
import dayjs from 'dayjs'

import { LEND_BORROW_24H_DIFF } from 'providers/LoansProvider/queries/loansHistory.query'

import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { calcDiffBetweenTwoNumbersInPersentage, convertNumberForClient } from 'utils/calcFunctions'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

/**
 *
 * @returns last 24h volume change in $ and in %
 */
const useLendBorrow24hDiff = (): {
  last24hLendingVol: number
  lending24hPersentChange: number
  last24hBorrowingVol: number
  borrowing24hPersentChange: number
  isLoading: boolean
} => {
  const { tokensMetadata, tokensPrices } = useTokensContext()

  const [currentTotalLended, setCurrentTotalLended] = useState(0)
  const [currentTotalBorrowed, setCurrentTotalBorrowed] = useState(0)
  const [last24hLending, setLast24hLending] = useState(0)
  const [last24hBorrowing, setLast24hBorrowing] = useState(0)
  const [ISOTimestamp, setISOTimestamp] = useState(dayjs().subtract(1, 'day').toISOString())

  // need this interval cuz we need to get all operations for last 24h, and we need to pass timestamp of this time but previous day
  useEffect(() => {
    const intervalId = setInterval(() => setISOTimestamp(dayjs().subtract(1, 'day').toISOString()), 10000)
    return clearInterval(intervalId)
  }, [])

  const { loading: isLoading } = useSubscription(LEND_BORROW_24H_DIFF, {
    variables: {
      currentTimestamp: ISOTimestamp,
    },
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      if (!data) return

      const { last24hLending, last24hBorrowing } = data.lending_controller[0].history_data.reduce(
        (acc, operation) => {
          const tokenAddress = operation.loan_token?.token.token_address

          if (!tokenAddress) return acc

          const token = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
          if (!token || !token.rate) return acc
          const { decimals, rate } = token

          const isLending = [0, 1].includes(operation.type)

          if (isLending) {
            acc.last24hLending +=
              convertNumberForClient({ number: operation.amount, grade: decimals }) *
              rate *
              (operation.type === 1 ? -1 : 1)
          } else {
            acc.last24hBorrowing +=
              convertNumberForClient({ number: operation.amount, grade: decimals }) *
              rate *
              ([3, 5, 7].includes(operation.type) ? -1 : 1)
          }

          return acc
        },
        { last24hLending: 0, last24hBorrowing: 0 },
      )

      const { currentTotalLended, currentTotalBorrowed } = data.lending_controller[0].loan_tokens.reduce(
        (acc, { token: { token_address }, total_borrowed, token_pool_total }) => {
          const token = getTokenDataByAddress({ tokenAddress: token_address, tokensMetadata, tokensPrices })
          if (!token || !token.rate) return acc

          const { decimals, rate } = token

          acc.currentTotalBorrowed += convertNumberForClient({ number: total_borrowed, grade: decimals }) * rate
          acc.currentTotalLended += convertNumberForClient({ number: token_pool_total, grade: decimals }) * rate

          return acc
        },
        {
          currentTotalLended: 0,
          currentTotalBorrowed: 0,
        },
      )

      setLast24hBorrowing(last24hBorrowing)
      setLast24hLending(last24hLending)
      setCurrentTotalBorrowed(currentTotalBorrowed)
      setCurrentTotalLended(currentTotalLended)
    },
    onError: (error) => {
      console.error('LENDING_24H_OPERATIONS_QUERY error: ', { error })
    },
  })

  const lending24hPersentChange = calcDiffBetweenTwoNumbersInPersentage(
    currentTotalBorrowed,
    currentTotalBorrowed - last24hLending,
  )
  const borrowing24hPersentChange = calcDiffBetweenTwoNumbersInPersentage(
    currentTotalLended,
    currentTotalLended - last24hLending,
  )

  return {
    lending24hPersentChange,
    borrowing24hPersentChange,
    last24hBorrowingVol: currentTotalBorrowed - (currentTotalBorrowed - last24hBorrowing),
    last24hLendingVol: currentTotalLended - (currentTotalLended - last24hLending),
    isLoading,
  }
}

export default useLendBorrow24hDiff

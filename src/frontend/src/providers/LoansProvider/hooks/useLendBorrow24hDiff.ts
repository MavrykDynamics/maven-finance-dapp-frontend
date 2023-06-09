import { useState } from 'react'
import { useQuery, useSubscription } from '@apollo/client'
import dayjs from 'dayjs'

import {
  LENDING_24H_OPERATIONS_QUERY,
  BORROWING_24H_OPERATIONS_QUERY,
  GET_CURRENT_LOANS_TOTAL_LEND_BORROW,
} from 'gql/subscriptions/loans.queries'

import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { calcDiffBetweenTwoNumbersInPersentage, convertNumberForClient } from 'utils/calcFunctions'

// TODO: use useSubscriptions
const useLendBorrow24hDiff = (): {
  lending24hPersentChange: number
  borrowing24hPersentChange: number
  isLoading: boolean
} => {
  const { tokensMetadata, tokensPrices } = useTokensContext()

  const [currentTotalLended, setCurrentTotalLended] = useState(0)
  const [currentTotalBorrowed, setCurrentTotalBorrowed] = useState(0)
  const [last24hLending, setLast24hLending] = useState(0)
  const [last24hBorrowing, setLast24hBorrowing] = useState(0)

  const { loading: isLending24hLoading } = useQuery(LENDING_24H_OPERATIONS_QUERY, {
    variables: {
      currentTimestamp: dayjs().toISOString(),
    },
    onCompleted: (data) => {
      const last24hLending = data.lending_controller[0].history_data.reduce((acc, operation) => {
        const tokenAddress = operation.loan_token?.token.token_address

        if (!tokenAddress) return acc

        const { decimals, symbol } = tokensMetadata[tokenAddress]
        const rate = tokensPrices[symbol]

        return (acc +=
          convertNumberForClient({ number: operation.amount, grade: decimals }) *
          rate *
          (operation.type === 1 ? -1 : 1))
      }, 0)
      setLast24hLending(last24hLending)
    },
    onError: (error) => {
      console.error('LENDING_24H_OPERATIONS_QUERY error: ', { error })
    },
  })

  const { loading: isBorrowing24hLoading } = useQuery(BORROWING_24H_OPERATIONS_QUERY, {
    variables: {
      currentTimestamp: dayjs().toISOString(),
    },
    onCompleted: (data) => {
      const last24hLending = data.lending_controller[0].history_data.reduce((acc, operation) => {
        const tokenAddress = operation.loan_token?.token.token_address

        if (!tokenAddress) return acc

        const { decimals, symbol } = tokensMetadata[tokenAddress]
        const rate = tokensPrices[symbol]

        return (acc +=
          convertNumberForClient({ number: operation.amount, grade: decimals }) *
          rate *
          ([3, 5, 7].includes(operation.type) ? -1 : 1))
      }, 0)
      setLast24hBorrowing(last24hLending)
    },
    onError: (error) => {
      console.error('BORROWING_24H_OPERATIONS_QUERY error: ', { error })
    },
  })

  const { loading: isTotalLoading } = useSubscription(GET_CURRENT_LOANS_TOTAL_LEND_BORROW, {
    onData: ({ data: { data } }) => {
      if (!data) return

      const { currentTotalLended, currentTotalBorrowed } = data.lending_controller[0].loan_tokens.reduce(
        (acc, { token, total_borrowed, token_pool_total }) => {
          const tokenAddress = token.token_address
          if (!tokenAddress) return acc

          const { decimals, symbol } = tokensMetadata[tokenAddress]
          const rate = tokensPrices[symbol]

          acc.currentTotalBorrowed += convertNumberForClient({ number: total_borrowed, grade: decimals }) * rate
          acc.currentTotalLended += convertNumberForClient({ number: token_pool_total, grade: decimals }) * rate

          return acc
        },
        {
          currentTotalLended: 0,
          currentTotalBorrowed: 0,
        },
      )

      setCurrentTotalBorrowed(currentTotalBorrowed)
      setCurrentTotalLended(currentTotalLended)
    },
    onError: (error) => {
      console.error('GET_CURRENT_LOANS_TOTAL_LEND_BORROW error: ', { error })
    },
  })

  const lending24hPersentChange = calcDiffBetweenTwoNumbersInPersentage(
    currentTotalBorrowed,
    currentTotalBorrowed - last24hLending,
  )
  const borrowing24hPersentChange = calcDiffBetweenTwoNumbersInPersentage(
    currentTotalLended,
    currentTotalLended - last24hBorrowing,
  )

  return {
    lending24hPersentChange,
    borrowing24hPersentChange,
    isLoading: isTotalLoading || isLending24hLoading || isBorrowing24hLoading,
  }
}

export default useLendBorrow24hDiff

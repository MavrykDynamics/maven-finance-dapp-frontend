import { useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'

// consts
import { LEND_BORROW_24H_DIFF } from 'providers/LoansProvider/queries/loansHistory.query'

// hooks
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// utils
import { calcDiffBetweenTwoNumbersInPersentage, convertNumberForClient } from 'utils/calcFunctions'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

// types
import { GetLending24hDiffQuery } from 'utils/__generated__/graphql'

const refetchQueryVariables = () => ({
  currentTimestamp: dayjs().subtract(1, 'day').toISOString(),
})

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
  const { handleApolloError } = useApolloContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()

  const hookInitIsoTime = useRef(dayjs().subtract(1, 'day').toISOString())

  const [currentTotalLended, setCurrentTotalLended] = useState(0)
  const [currentTotalBorrowed, setCurrentTotalBorrowed] = useState(0)
  const [last24hLending, setLast24hLending] = useState(0)
  const [last24hBorrowing, setLast24hBorrowing] = useState(0)
  const [indexerData, setIndexerData] = useState<GetLending24hDiffQuery | null>(null)

  useQueryWithRefetch(
    LEND_BORROW_24H_DIFF,
    {
      variables: {
        currentTimestamp: hookInitIsoTime.current,
        isMockTime: process.env.REACT_APP_DATA_ENV === 'dev',
      },
      onCompleted: (data) => setIndexerData(data),
      onError: (error) => handleApolloError(error, 'LEND_BORROW_24H_DIFF'),
    },
    {
      refetchQueryVariables,
    },
  )

  useEffect(() => {
    if (!indexerData) return

    const { last24hLending, last24hBorrowing } = indexerData.lending_controller[0].history_data.reduce(
      (acc, operation) => {
        const token = getTokenDataByAddress({
          tokenAddress: operation.loan_token?.token.token_address,
          tokensMetadata,
          tokensPrices,
        })
        if (!token || !token.rate) return acc

        const { decimals, rate } = token

        const isLending = [0, 1].includes(operation.type)
        const isBorrowing = [2, 3].includes(operation.type)
        const convertedAmount = convertNumberForClient({ number: operation.amount, grade: decimals }) * rate

        if (isLending) {
          acc.last24hLending += convertedAmount * (operation.type === 1 ? -1 : 1)
        }

        if (isBorrowing) {
          acc.last24hBorrowing += convertedAmount * (operation.type === 3 ? -1 : 1)
        }

        return acc
      },
      { last24hLending: 0, last24hBorrowing: 0 },
    )

    const { currentTotalLended, currentTotalBorrowed } = indexerData.lending_controller[0].loan_tokens.reduce(
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
  }, [indexerData, tokensMetadata, tokensPrices])

  const borrowing24hPersentChange = calcDiffBetweenTwoNumbersInPersentage(
    currentTotalBorrowed,
    currentTotalBorrowed - last24hBorrowing,
  )
  const lending24hPersentChange = calcDiffBetweenTwoNumbersInPersentage(
    currentTotalLended,
    currentTotalLended - last24hLending,
  )

  return {
    lending24hPersentChange,
    borrowing24hPersentChange,
    last24hBorrowingVol: last24hBorrowing,
    last24hLendingVol: last24hLending,
    isLoading: indexerData === null ? true : false,
  }
}

export default useLendBorrow24hDiff

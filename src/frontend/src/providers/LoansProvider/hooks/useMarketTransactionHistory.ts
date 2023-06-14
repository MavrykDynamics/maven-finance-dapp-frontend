import { useState } from 'react'
import { useSubscription } from '@apollo/client'

// providers
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// types
import { LoansMarketTransactionHistoryArgs, LoansMarketTransactionHistoryType } from '../helpers/loans.types'

// consts & helpers
import { GET_LOANS_HISTORY_FOR_MARKET_DATA } from 'gql/subscriptions/loans.queries'
import { convertNumberForClient } from 'utils/calcFunctions'
import { parseDate } from 'utils/time'
import { getDescrByType } from '../helpers/loans.utils'
import { COLLATERAL_HISTORY_DATA_TYPES } from '../helpers/loans.const'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

/**
 *
 * @param param0.marketTokenAddress – market token address to get transactions for
 * TODO: implement getting transaction history for certain user
 */
const useMarketTransactionHistory = ({ marketTokenAddress, userAddress }: LoansMarketTransactionHistoryArgs) => {
  const { tokensMetadata, tokensPrices } = useTokensContext()

  const [transactionHistory, setTransactionHistory] = useState<Array<LoansMarketTransactionHistoryType>>([])

  const { loading } = useSubscription(GET_LOANS_HISTORY_FOR_MARKET_DATA, {
    variables: {
      marketTokenAddress,
    },
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      if (!data) return

      const newTransactionHistory = data.lending_controller[0].history_data.reduce<
        Array<LoansMarketTransactionHistoryType>
      >(
        (
          acc,
          {
            type,
            amount,
            timestamp,
            vault,
            sender: { address: senderAddress },
            operation_hash,
            loan_token,
            collateral_token,
          },
        ) => {
          if (!loan_token) return acc
          const loanTokenAddress = loan_token.token.token_address
          const collateralTokenAddress = collateral_token?.token.token_address

          const tokenAddress =
            COLLATERAL_HISTORY_DATA_TYPES.includes(type) && collateralTokenAddress
              ? collateralTokenAddress
              : loanTokenAddress

          const token = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })

          if (!token || !token.rate) return acc

          const { symbol, decimals, rate } = token

          const convertedAmount = convertNumberForClient({ number: amount, grade: decimals })
          const amountInUsd = convertedAmount * rate

          const transactionHistoryItem: LoansMarketTransactionHistoryType = {
            amount: convertedAmount,
            usdValue: amountInUsd,
            tokenAddress,
            symbol,
            date: parseDate({ time: new Date(timestamp).getTime(), timeFormat: 'MMM Do, YYYY, HH:mm:ss UTC' }),
            vaultAddress: vault?.vault?.address,
            userAddress: senderAddress,
            operationHash: operation_hash,
            descr: getDescrByType(type),
          }

          acc.push(transactionHistoryItem)

          return acc
        },
        [],
      )

      console.log({ newTransactionHistory })

      setTransactionHistory(newTransactionHistory)
    },
    onError: (error) => {
      console.error('GET_LOANS_HISTORY_DATA error: ', { error })
    },
  })

  return { isLoading: loading, transactionHistory }
}

export default useMarketTransactionHistory

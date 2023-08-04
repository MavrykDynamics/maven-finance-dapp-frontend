import { useMemo } from 'react'
import { useSubscription } from '@apollo/client'

// providers
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// types
import { LoansMarketTransactionHistoryArgs, LoansMarketTransactionHistoryType } from '../helpers/loans.types'

// consts & helpers
import { getLoansHistorySubscription } from 'providers/LoansProvider/queries/loansHistory.query'
import { convertNumberForClient } from 'utils/calcFunctions'
import { parseDate } from 'utils/time'
import { getDescrByType } from '../helpers/loans.utils'
import { COLLATERAL_HISTORY_DATA_TYPES } from '../helpers/loans.const'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { SMVK_TOKEN_ADDRESS } from 'utils/constants'

/**
 *
 * @param param0.marketTokenAddress – market token address to get transactions for
 * @param param0.userAddress – user address for which get transaction history
 * @param param0.typeFilter – array of descr types 1-11, mapper of type -> descr is: getDescrByType
 */
const useMarketTransactionHistory = ({
  marketTokenAddress,
  userAddress,
  vaultAddress,
  typeFilter,
}: LoansMarketTransactionHistoryArgs) => {
  const { tokensMetadata, tokensPrices } = useTokensContext()

  const { loading, data: transactionHistoryIndexer } = useSubscription(
    getLoansHistorySubscription({ userAddress, vaultAddress, typeFilter }),
    {
      skip: (!userAddress && !vaultAddress) || !marketTokenAddress,
      variables: {
        marketTokenAddress,
        userAddress,
        vaultAddress,
        typeFilter,
      },
      shouldResubscribe: true,
      onError: (error) => {
        console.error('GET_LOANS_HISTORY_DATA error: ', { error })
      },
    },
  )

  const transactionHistory = useMemo(() => {
    if (!transactionHistoryIndexer) return []

    return transactionHistoryIndexer.lending_controller[0].history_data.reduce<
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
        const isSmvkCollateral = collateral_token?.token.mvk_tokens.length

        const tokenAddress =
          COLLATERAL_HISTORY_DATA_TYPES.includes(type) && collateralTokenAddress
            ? isSmvkCollateral
              ? SMVK_TOKEN_ADDRESS
              : collateralTokenAddress
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
  }, [tokensMetadata, tokensPrices, transactionHistoryIndexer])

  return { isLoading: loading, transactionHistory }
}

export default useMarketTransactionHistory

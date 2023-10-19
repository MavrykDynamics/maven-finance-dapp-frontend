import qs from 'qs'
import { useHistory, useLocation } from 'react-router'
import { useEffect, useMemo, useState } from 'react'

// hooks
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// types
import { GetLoansTransactionsHistoryQuery } from 'utils/__generated__/graphql'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import { LoansMarketTransactionHistoryType } from '../helpers/loans.types'

// consts
import { COLLATERAL_HISTORY_DATA_TYPES } from '../helpers/loans.const'
import { SMVK_TOKEN_ADDRESS } from 'utils/constants'
import { getLoansTransactionsHistory } from 'providers/LoansProvider/queries/loansHistory.query'

// utils
import { getDescrByType } from '../helpers/loans.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import { parseDate } from 'utils/time'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import {
  LIST_NAMES_MAPPER,
  TRANSACTION_HISTORY_TABLE_NAME,
  getPageNumber,
  updatePageInUrl,
} from 'app/App.components/Pagination/pagination.consts'

type LoansMarketTransactionHistoryArgs = {
  marketTokenAddress: TokenAddressType
  userAddress?: string
  vaultAddress?: string
  typeFilter?: Array<number>
}

type TransactionHistoryStateType = { list: Record<number, GetLoansTransactionsHistoryQuery>; itemsAmount: number }

const transactionHistoryItemsPerPage = LIST_NAMES_MAPPER[TRANSACTION_HISTORY_TABLE_NAME]

/**
 *
 * @param marketTokenAddress – market token address to get transactions for
 * @param userAddress – user address for which get transaction history
 * @param vaultAddress – vault address for which get transaction history
 * @param typeFilter – array of descr types 1-11, mapper of type -> descr is: getDescrByType
 */
export const useLoansTransactionHistory = ({
  marketTokenAddress,
  userAddress,
  vaultAddress,
  typeFilter,
}: LoansMarketTransactionHistoryArgs) => {
  const { handleApolloError } = useApolloContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { bug } = useToasterContext()

  // when user has no data
  const [isHistoryEmpty, setIsHistoryEmpty] = useState(false)

  // stuff for handling page out of limims
  const history = useHistory()
  const { search, pathname } = useLocation()
  const { page = '', ...restQP } = qs.parse(search, { ignoreQueryPrefix: true })
  const currentPage = useMemo(() => getPageNumber(search, TRANSACTION_HISTORY_TABLE_NAME), [search])

  const [transactionHistoryIndexer, setTransactionHistoryIndexer] = useState<TransactionHistoryStateType>({
    list: {},
    itemsAmount: 0,
  })

  useEffect(() => {
    return () => setTransactionHistoryIndexer({ list: {}, itemsAmount: 0 })
  }, [marketTokenAddress, vaultAddress])

  // always load new txHistory on market | vault address change
  useQueryWithRefetch(getLoansTransactionsHistory({ userAddress, vaultAddress, typeFilter }), {
    skip: (!userAddress && !vaultAddress) || !marketTokenAddress,
    variables: {
      marketTokenAddress,
      userAddress,
      vaultAddress,
      typeFilter,
      offset: transactionHistoryItemsPerPage * (currentPage - 1),
      limit: transactionHistoryItemsPerPage,
      isMockTime: process.env.REACT_APP_DATA_ENV === 'dev',
    },
    onCompleted: (data) => {
      const itemsAmount = data.lending_controller[0].historyItemsAmount.aggregate?.count ?? 0
      const maxPage = Math.ceil(itemsAmount / transactionHistoryItemsPerPage)

      // handle user empty history
      itemsAmount === 0 ? setIsHistoryEmpty(true) : setIsHistoryEmpty(false)

      // if user updated manualy page, and set it wrong, redirect him to 1st page of the list
      if ((maxPage < currentPage || currentPage < 1) && itemsAmount !== 0) {
        bug(`Page is out of limits, your page: ${currentPage}, max page: ${maxPage}, min page: 1`)
        const redirectToFirstPageOfTheList = updatePageInUrl({
          page,
          newPage: 1,
          listName: TRANSACTION_HISTORY_TABLE_NAME,
          pathname,
          restQP,
        })
        history.replace(redirectToFirstPageOfTheList)
      } else {
        setTransactionHistoryIndexer((prev) => ({
          list: {
            ...prev.list,
            [currentPage]: data,
          },
          itemsAmount,
        }))
      }
    },
    onError: (error) =>
      handleApolloError(error, 'GET_LOANS_HISTORY_DATA', 'Loading transactions history error, please reload the page'),
  })

  const transactionHistory = useMemo(() => {
    if (!transactionHistoryIndexer.list[currentPage]) return []

    return transactionHistoryIndexer.list[currentPage].lending_controller[0].history_data.reduce<
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
  }, [currentPage, tokensMetadata, tokensPrices, transactionHistoryIndexer.list])

  return {
    isLoading: !transactionHistoryIndexer.list[currentPage] && !isHistoryEmpty,
    transactionHistory,
    itemsAmount: transactionHistoryIndexer.itemsAmount,
  }
}

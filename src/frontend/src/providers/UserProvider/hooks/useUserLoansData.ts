import {useEffect, useState} from 'react'

// hooks
import {useTokensContext} from 'providers/TokensProvider/tokens.provider'
import {useApolloContext} from 'providers/ApolloProvider/apollo.provider'
import {useUserContext} from '../user.provider'
import {useQueryWithRefetch} from 'providers/common/hooks/useQueryWithRefetch'

// utils
import {normalizeUserLoansData} from '../helpers/userLoansData.normalizer'

// consts
import {DEFAULT_USER_LOANS_DATA} from '../helpers/user.consts'
import {GET_USER_LOANS_DATA} from '../queries/userLoans.query'

// types
import {GetUserLoansDataQuery} from 'utils/__generated__/graphql'

/**
 *
 * @param param0.userAddress – address of the current user to get his lend/borrow data
 * @returns returns user's loans data, all values are converted to USD, this data is used to show his loans stats
 */
const useUserLoansData = () => {
  const { handleApolloError } = useApolloContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { userLoansData, setUserLoansData, userAddress } = useUserContext()

  const [indexerData, setIndexerData] = useState<GetUserLoansDataQuery | null>(null)

  useEffect(() => {
    if (!indexerData) return

    if (!indexerData.maven_user[0]) {
      setUserLoansData(DEFAULT_USER_LOANS_DATA)
      return
    }

    const { userLendings, userBorrowings, userVaultsData, totalUserLended, totalUserBorrowed } = normalizeUserLoansData(
      indexerData,
      tokensMetadata,
      tokensPrices,
    )

    setUserLoansData({ userLendings, userBorrowings, userVaultsData, totalUserLended, totalUserBorrowed })
  }, [indexerData, tokensMetadata, tokensPrices])

  useQueryWithRefetch(GET_USER_LOANS_DATA, {
    skip: !userAddress,
    variables: {
      userAddress,
    },
    onCompleted: (data) => setIndexerData(data),
    onError: (error) => handleApolloError(error, 'GET_USER_LOANS_DATA'),
  })

  return {
    isLoading: userAddress ? userLoansData === null : false,
    ...(userLoansData ? userLoansData : DEFAULT_USER_LOANS_DATA),
  }
}

export default useUserLoansData

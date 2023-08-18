import { useEffect, useState } from 'react'

import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

import { normalizeUserLoansData } from '../helpers/userLoansData.normalizer'
import { GET_USER_LOANS_DATA } from '../queries/userLoans.query'

import { GetUserLoansDataQuery } from 'utils/__generated__/graphql'
import { DEFAULT_USER_LOANS_DATA } from '../helpers/user.consts'
import { useUserContext } from '../user.provider'

/**
 *
 * @param param0.userAddress – address of the current user to get his lend/borrow data
 * @returns returns user's loans data, all values are converted, this data is used to show his loans stats
 */
const useUserLoansData = () => {
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { userLoansData, setUserLoansData, userAddress } = useUserContext()

  const [indexerData, setIndexerData] = useState<GetUserLoansDataQuery | null>(null)

  useEffect(() => {
    if (!indexerData || !indexerData.mavryk_user[0]) return

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
    onCompleted: (data) => {
      setIndexerData(data)
    },
    onError: (error) => {
      console.error('GET_USER_LOANS_DATA error: ', { error })
    },
  })

  return {
    isLoading: userAddress ? userLoansData === null : false,
    ...(userLoansData ? userLoansData : DEFAULT_USER_LOANS_DATA),
  }
}

export default useUserLoansData

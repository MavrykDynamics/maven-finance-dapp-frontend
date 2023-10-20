import { useState } from 'react'

// hooks
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { useUserContext } from '../user.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// consts
import { USER_ACTIONS_EARNING_HISTORY_DATA_QUERY } from '../queries/userData.query'

// utils
import { normalizeUserEarningHistory } from '../helpers/userEarningHistory.normalizer'

export const useUserEarningsHistory = () => {
  const { handleApolloError } = useApolloContext()
  const { userAddress, earningHistory, setUserEarningHistory } = useUserContext()

  const [isNewUser, setIsNewUser] = useState(false)

  useQueryWithRefetch(USER_ACTIONS_EARNING_HISTORY_DATA_QUERY, {
    skip: !userAddress,
    variables: {
      userAddress: userAddress ?? '',
    },
    onCompleted: (data) => {
      // newly registered user, means no opearions performed
      if (!data.mavryk_user[0]) {
        setIsNewUser(true)
        return
      }

      const normalizedEarningHistory = normalizeUserEarningHistory(data)
      console.log({ data, normalizedEarningHistory })
      setUserEarningHistory(normalizedEarningHistory)
    },
    onError: (error) => handleApolloError(error, 'USER_ACTIONS_EARNING_HISTORY_DATA_QUERY'),
  })

  return {
    isLoading: isNewUser ? false : earningHistory === null,
    earningHistory: earningHistory ?? [],
  }
}

import { useState } from 'react'

// hooks
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { useUserContext } from '../user.provider'
import { useGraphQLQuery } from 'providers/QueryProvider/useGraphQLQuery'

// consts
import { USER_ACTIONS_EARNING_HISTORY_DATA_QUERY } from '../queries/userData.query'

// utils
import { normalizeUserEarningHistory } from '../helpers/userEarningHistory.normalizer'

export const useUserEarningsHistory = () => {
  const { handleQueryError } = useQueryProvider()
  const { userAddress, earningHistory, setUserEarningHistory } = useUserContext()

  const [isNewUser, setIsNewUser] = useState(false)

  useGraphQLQuery(USER_ACTIONS_EARNING_HISTORY_DATA_QUERY, {
    skip: !userAddress,
    variables: {
      userAddress: userAddress ?? '',
    },
    onCompleted: (data) => {
      // newly registered user, means no operations performed
      if (!data.maven_user[0]) {
        setIsNewUser(true)
        return
      }

      const normalizedEarningHistory = normalizeUserEarningHistory(data)
      setUserEarningHistory(normalizedEarningHistory)
    },
    onError: (error) => handleQueryError(error, 'USER_ACTIONS_EARNING_HISTORY_DATA_QUERY'),
  })

  return {
    isLoading: isNewUser ? false : earningHistory === null,
    earningHistory: earningHistory ?? [],
  }
}

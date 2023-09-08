import { useLocation } from 'react-router'

// hooks
import { useUserContext } from '../user.provider'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// utils
import { normalizeUserRewards } from '../helpers/userData.helpers'

// consts
import { USER_REWARDS_DATA_QUERY } from '../queries/userData.query'
import { LIST_NAMES_MAPPER, USER_ACTIONS_HISTORY, getPageNumber } from 'app/App.components/Pagination/pagination.consts'
import { DEFAULT_USER_REWARDS } from '../helpers/user.consts'

const userActionsHistoryItemsPerPage = LIST_NAMES_MAPPER[USER_ACTIONS_HISTORY]

export const useUserRewards = () => {
  const { handleApolloError } = useApolloContext()
  const { setUserRewards, userAddress, rewards } = useUserContext()

  const { search } = useLocation()
  const currentPage = getPageNumber(search, USER_ACTIONS_HISTORY)

  useQueryWithRefetch(USER_REWARDS_DATA_QUERY, {
    skip: !userAddress,
    variables: {
      userAddress: userAddress ?? '',
      offset: userActionsHistoryItemsPerPage * (currentPage - 1),
      limit: userActionsHistoryItemsPerPage,
    },
    onCompleted: (data) => {
      // newly registered user, means no opearions performed
      if (!data.mavryk_user[0]) {
        setUserRewards(DEFAULT_USER_REWARDS)
        return
      }

      const rewardsIndexerData = data.mavryk_user[0]
      const userProposalRewards = data.governance_proposal

      const normalizedUserRewards = normalizeUserRewards({ rewardsIndexerData, userProposalRewards })
      setUserRewards(normalizedUserRewards)
    },
    onError: (error) => handleApolloError(error, 'USER_REWARDS_DATA_QUERY'),
  })

  return {
    isLoading: userAddress ? rewards === null : false,
    ...(rewards ?? DEFAULT_USER_REWARDS),
  }
}

import { useLocation } from 'react-router-dom'

// hooks
import { useUserContext } from '../user.provider'
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { useGraphQLQuery } from 'providers/QueryProvider/useGraphQLQuery'

// utils
import { normalizeUserRewards } from '../helpers/userData.helpers'

// consts
import { USER_REWARDS_DATA_QUERY } from '../queries/userData.query'
import { getPageNumber, LIST_NAMES_MAPPER, USER_ACTIONS_HISTORY } from 'app/App.components/Pagination/pagination.consts'
import { DEFAULT_USER_REWARDS } from '../helpers/user.consts'

const userActionsHistoryItemsPerPage = LIST_NAMES_MAPPER[USER_ACTIONS_HISTORY]

export const useUserRewards = () => {
  const { handleQueryError } = useQueryProvider()
  const { setUserRewards, userAddress, rewards } = useUserContext()

  const { search } = useLocation()
  const currentPage = getPageNumber(search, USER_ACTIONS_HISTORY)

  useGraphQLQuery(USER_REWARDS_DATA_QUERY, {
    skip: !userAddress,
    variables: {
      userAddress: userAddress ?? '',
      offset: userActionsHistoryItemsPerPage * (currentPage - 1),
      limit: userActionsHistoryItemsPerPage,
    },
    onCompleted: (data) => {
      try {
        // newly registered user, means no operations performed
        if (!data.maven_user[0]) {
          setUserRewards(DEFAULT_USER_REWARDS)
          return
        }

        const rewardsIndexerData = data.maven_user[0]
        const userProposalRewards = data.governance_proposal

        const normalizedUserRewards = normalizeUserRewards({ rewardsIndexerData, userProposalRewards })
        setUserRewards(normalizedUserRewards)
      } catch (_) {
        // Fall back to default rewards if normalization fails (unexpected indexer data structure)
        setUserRewards(DEFAULT_USER_REWARDS)
      }
    },
    onError: (error) => {
      handleQueryError(error, 'USER_REWARDS_DATA_QUERY')
      // Set default rewards on error so the page doesn't stay stuck on loading
      setUserRewards(DEFAULT_USER_REWARDS)
    },
  })

  return {
    isLoading: userAddress ? rewards === null : false,
    ...(rewards ?? DEFAULT_USER_REWARDS),
  }
}

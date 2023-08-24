import { useLocation } from 'react-router'

// hooks
import { useUserContext } from '../user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// utils
import { normalizeUserRewards } from '../helpers/userData.helpers'

// consts
import { USER_REWARDS_DATA_QUERY } from '../queries/userData.query'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { LIST_NAMES_MAPPER, USER_ACTIONS_HISTORY, getPageNumber } from 'app/App.components/Pagination/pagination.consts'
import { DEFAULT_USER_REWARDS } from '../helpers/user.consts'

const userActionsHistoryItemsPerPage = LIST_NAMES_MAPPER[USER_ACTIONS_HISTORY]

export const useUserRewards = () => {
  const { setUserRewards, userAddress, rewards } = useUserContext()
  const { bug } = useToasterContext()

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
      if (!data.mavryk_user[0]) return

      const rewardsIndexerData = data.mavryk_user[0]
      const userProposalRewards = data.governance_proposal

      const normalizedUserRewards = normalizeUserRewards({ rewardsIndexerData, userProposalRewards })
      setUserRewards(normalizedUserRewards)
    },
    onError: (e) => {
      console.error(`USER_REWARDS_DATA_QUERY query error: `, e)
      bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
    },
  })

  return {
    isLoading: userAddress ? rewards === null : false,
    ...(rewards ?? DEFAULT_USER_REWARDS),
  }
}

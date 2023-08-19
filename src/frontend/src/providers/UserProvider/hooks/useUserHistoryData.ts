import qs from 'qs'
import { useNavigate, useLocation } from 'react-router'

// hooks
import { useUserContext } from '../user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// utils
import { normalizeUserHistoryData } from '../helpers/userData.helpers'

// consts
import { USER_ACTIONS_HISTORY_DATA_QUERY } from '../queries/userData.query'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import {
  LIST_NAMES_MAPPER,
  USER_ACTIONS_HISTORY,
  getPageNumber,
  updatePageInUrl,
} from 'app/App.components/Pagination/pagination.consts'

const userActionsHistoryItemsPerPage = LIST_NAMES_MAPPER[USER_ACTIONS_HISTORY]

export const useUserHistoryData = () => {
  const { setUserHistoryData, userAddress, actionsHistory } = useUserContext()
  const { bug } = useToasterContext()

  // stuff for handling page out of limims
  const navigate = useNavigate()
  const { search, pathname } = useLocation()
  const { page = '', ...restQP } = qs.parse(search, { ignoreQueryPrefix: true })
  const currentPage = getPageNumber(search, USER_ACTIONS_HISTORY)

  useQueryWithRefetch(USER_ACTIONS_HISTORY_DATA_QUERY, {
    skip: !userAddress || Boolean(actionsHistory.paginatedList[currentPage]),
    variables: {
      userAddress: userAddress ?? '',
      offset: userActionsHistoryItemsPerPage * (currentPage - 1),
      limit: userActionsHistoryItemsPerPage,
    },
    onCompleted: (data) => {
      // newly registered user, means no opearions performed
      if (!data.mavryk_user[0]) return

      const itemsAmount = data.mavryk_user[0].historyItemsAmount.aggregate?.count ?? 0
      const maxPage = Math.ceil(itemsAmount / userActionsHistoryItemsPerPage)

      // if user updated manualy page, and set it wrong, redirect him to 1st page of the list
      if (maxPage < currentPage || currentPage < 1) {
        bug(`Page is out of limits, your page: ${currentPage}, max page: ${maxPage}, min page: 1`)
        const redirectToFirstPageOfTheList = updatePageInUrl({
          page,
          newPage: 1,
          listName: USER_ACTIONS_HISTORY,
          pathname,
          restQP,
        })
        navigate(redirectToFirstPageOfTheList, { replace: true })
      } else {
        const normalizedUserHistoryData = normalizeUserHistoryData(data.mavryk_user[0].stakes_history_data)
        setUserHistoryData(currentPage, normalizedUserHistoryData, itemsAmount)
      }
    },
    onError: (e) => {
      console.error(`USER_ACTIONS_HISTORY_DATA_QUERY query error: `, e)
      bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
    },
  })

  return {
    isLoading: !actionsHistory.paginatedList[currentPage],
    totalItemsAmount: actionsHistory.itemsAmount,
    userActionsHistory: actionsHistory.paginatedList[currentPage],
  }
}

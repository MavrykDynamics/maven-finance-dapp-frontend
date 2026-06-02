import qs from 'qs'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router' // hooks
import { useUserContext } from '../user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { useGraphQLQuery } from 'providers/QueryProvider/useGraphQLQuery' // utils
import { normalizeUserHistoryData } from '../helpers/userData.helpers' // consts
import { USER_ACTIONS_HISTORY_DATA_QUERY } from '../queries/userData.query'
import {
  getPageNumber,
  LIST_NAMES_MAPPER,
  updatePageInUrl,
  USER_ACTIONS_HISTORY,
} from 'app/App.components/Pagination/pagination.consts'

const userActionsHistoryItemsPerPage = LIST_NAMES_MAPPER[USER_ACTIONS_HISTORY]

export const useUserHistoryData = () => {
  const { handleQueryError } = useQueryProvider()
  const { setUserHistoryData, userAddress, actionsHistory } = useUserContext()
  const { bug } = useToasterContext()

  // stuff for handling page out of limits
  const navigate = useNavigate()
  const { search, pathname } = useLocation()
  const { page = '', ...restQP } = qs.parse(search, { ignoreQueryPrefix: true })
  const currentPage = getPageNumber(search, USER_ACTIONS_HISTORY)

  const [iseNewUser, setIsNewUser] = useState(false)

  useGraphQLQuery(USER_ACTIONS_HISTORY_DATA_QUERY, {
    skip: !userAddress || Boolean(actionsHistory.paginatedList[currentPage]),
    variables: {
      userAddress: userAddress ?? '',
      offset: userActionsHistoryItemsPerPage * (currentPage - 1),
      limit: userActionsHistoryItemsPerPage,
    },
    onCompleted: (data) => {
      // newly registered user, means no opearions performed
      if (!data.maven_user[0]) {
        setIsNewUser(true)
        return
      }

      const itemsAmount = data.maven_user[0].historyItemsAmount.aggregate?.count ?? 0
      const maxPage = Math.ceil(itemsAmount / userActionsHistoryItemsPerPage)

      // if user updated manually page, and set it wrong, redirect him to 1st page of the list
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
        const normalizedUserHistoryData = normalizeUserHistoryData(data.maven_user[0].stakes_history_data)
        setUserHistoryData(currentPage, normalizedUserHistoryData, itemsAmount)
      }
    },
    onError: (error) => handleQueryError(error, 'USER_ACTIONS_HISTORY_DATA_QUERY'),
  })

  return {
    isLoading: iseNewUser ? false : !actionsHistory.paginatedList[currentPage],
    totalItemsAmount: actionsHistory.itemsAmount,
    userActionsHistory: actionsHistory.paginatedList[currentPage],
  }
}

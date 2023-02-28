import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR } from 'app/App.components/Toaster/Toaster.constants'
import { AppDispatch, GetState } from 'app/App.controller'
import { fetchFromIndexer } from 'gql/fetchGraphQL'
import {
  FINANCIAL_REQUESTS_STORAGE_QUERY,
  FINANCIAL_REQUESTS_STORAGE_QUERY_NAME,
  FINANCIAL_REQUESTS_STORAGE_QUERY_VARIABLE,
} from 'gql/queries/getFinancialRequestStorage'
import { normalizeFinancialRequests } from './FinancialRequests.helpers'

export const GET_FINANCIAL_REQUEST_STORAGE = 'GET_FINANCIAL_REQUEST_STORAGE'
export const getFinancialRequestStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    tokens: { dipDupTokens },
  } = getState()
  try {
    const storage = await fetchFromIndexer(
      FINANCIAL_REQUESTS_STORAGE_QUERY,
      FINANCIAL_REQUESTS_STORAGE_QUERY_NAME,
      FINANCIAL_REQUESTS_STORAGE_QUERY_VARIABLE,
    )

    const financialRequests = normalizeFinancialRequests(storage, dipDupTokens)

    dispatch({
      type: GET_FINANCIAL_REQUEST_STORAGE,
      financialRequests,
    })
  } catch (error) {
    dispatch(showToaster(ERROR, 'Error while loading financial requests', 'Please try to reload page'))
  }
}

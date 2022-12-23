import type { AppDispatch, GetState } from '../../app/App.controller'
import { fetchFromIndexer } from 'gql/fetchGraphQL'
import { LOANS_QUERY, LOANS_QUERY_NAME, LOANS_QUERY_VARIABLE } from 'gql/queries/getLoansStorage'
import { normalizeLoans } from './Loans.helpers'

export const GET_LOANS_STORAGE = 'GET_LOANS_STORAGE'
export const getLoansStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    tokens: { dipDupTokens },
  } = getState()
  try {
    const storage = await fetchFromIndexer(LOANS_QUERY, LOANS_QUERY_NAME, LOANS_QUERY_VARIABLE)
    const normalizedLoans = normalizeLoans({ storage: storage?.lending_controller?.[0], dipDupTokens })

    dispatch({
      type: GET_LOANS_STORAGE,
      loansStorage: normalizedLoans,
    })
  } catch (e) {
    console.error('getLoansStorage error: ', e)
  }
}

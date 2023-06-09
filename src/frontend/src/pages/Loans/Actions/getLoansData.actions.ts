import { AppDispatch, GetState } from 'app/App.controller'
import { normalizeLoans } from '../Loans.normalizer'
import { normalizeVaultsStorage } from 'pages/Vaults/Vaults.normalizer'
import { fetchFromIndexer } from 'gql/fetchGraphQL'
import {
  LOANS_QUERY,
  LOANS_QUERY_NAME,
  LOANS_QUERY_VARIABLE,
  MVK_TOKEN_OPERATOR_QUERY,
  MVK_TOKEN_OPERATOR_QUERY_NAME,
  MVK_TOKEN_OPERATOR_QUERY_VARIABLE,
} from 'gql/queries/getLoansStorage'
import {
  VAULTS_STORAGE_QUERY,
  VAULTS_STORAGE_QUERY_NAME,
  VAULTS_STORAGE_QUERY_VARIABLE,
} from 'gql/queries/getVaultsStorage'

export const GET_LOANS_STORAGE = 'GET_LOANS_STORAGE'
export const GET_VAULTS_STORAGE = 'GET_VAULTS_STORAGE'
export const GET_MVK_TOKEN_OPERATOR_STORAGE = 'GET_MVK_TOKEN_OPERATOR_STORAGE'
export const getLoansStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    wallet: {
      accountPkh,
      // TODO: remove while user live update?
      user: { userMTokens },
    },
  } = getState()
  try {
    const [marketsStorage, vaultsStorage, mvkTokenOperatorStorage] = await Promise.all(
      [
        fetchFromIndexer(LOANS_QUERY, LOANS_QUERY_NAME, LOANS_QUERY_VARIABLE),
        fetchFromIndexer(VAULTS_STORAGE_QUERY, VAULTS_STORAGE_QUERY_NAME, VAULTS_STORAGE_QUERY_VARIABLE),
        accountPkh &&
          fetchFromIndexer(
            MVK_TOKEN_OPERATOR_QUERY,
            MVK_TOKEN_OPERATOR_QUERY_NAME,
            MVK_TOKEN_OPERATOR_QUERY_VARIABLE(accountPkh),
          ),
      ].filter(Boolean),
    )

    const normalizedLoansStorage = await normalizeLoans({
      lendingController: marketsStorage?.lending_controller?.[0],
      mvkTokenOperators: mvkTokenOperatorStorage?.mvk_token_operator ?? [],
      userMTokens,
      userAddres: accountPkh,
    })

    const normallaziedVaultsStorage = await normalizeVaultsStorage({
      lendingController: vaultsStorage?.lending_controller[0],
      accountPkh,
    })

    dispatch({
      type: GET_LOANS_STORAGE,
      loansStorage: { ...normalizedLoansStorage, vaults: normallaziedVaultsStorage },
    })
  } catch (e) {
    console.error('getLoansStorage error: ', e)
  }
}

import { AppDispatch, GetState } from 'app/App.controller'
import { normalizeLoans } from '../Loans.normalizer'
import { getCollateralTokens } from '../LoansFethcers'
import { normalizeVaultsStorage } from 'pages/Vaults/Vaults.normalizer'
import { fetchFromIndexer } from 'gql/fetchGraphQL'
import {
  AVALIABLE_COLLATERALS_QUERY,
  AVALIABLE_COLLATERALS_QUERY_NAME,
  AVALIABLE_COLLATERALS_QUERY_VARIABLE,
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
import { getXTZBakers } from 'providers/DAPPConfig/helpers/getXtzBakers'
import { DataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider.types'

export const GET_LOANS_STORAGE = 'GET_LOANS_STORAGE'
export const GET_VAULTS_STORAGE = 'GET_VAULTS_STORAGE'
export const GET_MVK_TOKEN_OPERATOR_STORAGE = 'GET_MVK_TOKEN_OPERATOR_STORAGE'
export const getLoansStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    tokens: { dipDupTokens, mTokens },
    wallet: {
      accountPkh,
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
      dipDupData: dipDupTokens,
      mTokens,
      userMTokens,
      userAddres: accountPkh,
      // TODO: add feeds on front
      feeds: [] as any,
    })

    const normallaziedVaultsStorage = await normalizeVaultsStorage({
      lendingController: vaultsStorage?.lending_controller[0],
      accountPkh,
      dipDupTokens,
      // TODO: add feeds on front
      feeds: [] as any,
    })

    dispatch({
      type: GET_LOANS_STORAGE,
      loansStorage: { ...normalizedLoansStorage, vaults: normallaziedVaultsStorage },
    })
  } catch (e) {
    console.error('getLoansStorage error: ', e)
  }
}

export const GET_AVALIABLE_COLLATERALS = 'GET_AVALIABLE_COLLATERALS'
export const getAvaliableCollaterals =
  (feedsLedger: DataFeedsContext['feedsMapper']) => async (dispatch: AppDispatch, getState: GetState) => {
    const {
      tokens: { dipDupTokens },
    } = getState()
    try {
      const storage = await fetchFromIndexer(
        AVALIABLE_COLLATERALS_QUERY,
        AVALIABLE_COLLATERALS_QUERY_NAME,
        AVALIABLE_COLLATERALS_QUERY_VARIABLE,
      )

      const avaliableCollaterals = getCollateralTokens(
        storage?.lending_controller?.[0]?.collateral_tokens,
        dipDupTokens,
        feedsLedger,
      )

      await dispatch({
        type: GET_AVALIABLE_COLLATERALS,
        avaliableCollaterals,
      })
    } catch (e) {
      console.log('getAvaliableCollaterals error: ', e)
    }
  }

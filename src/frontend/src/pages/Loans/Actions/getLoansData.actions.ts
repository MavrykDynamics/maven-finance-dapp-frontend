import { AppDispatch, GetState } from 'app/App.controller'
import { normalizeLoans } from '../Loans.normalizer'
import { getXTZBakers, getCollateralTokens } from '../LoansFethcers'
import { normalizeVaultsStorage } from 'pages/Vaults/Vaults.normalizer'
import { fetchFromIndexer } from 'gql/fetchGraphQL'
import {
  AVALIABLE_COLLATERALS_QUERY,
  AVALIABLE_COLLATERALS_QUERY_NAME,
  AVALIABLE_COLLATERALS_QUERY_VARIABLE,
  LOANS_QUERY,
  LOANS_QUERY_NAME,
  LOANS_QUERY_VARIABLE,
} from 'gql/queries/getLoansStorage'
import {
  VAULTS_STORAGE_QUERY,
  VAULTS_STORAGE_QUERY_NAME,
  VAULTS_STORAGE_QUERY_VARIABLE,
} from 'gql/queries/getVaultsStorage'

export const GET_LOANS_STORAGE = 'GET_LOANS_STORAGE'
export const GET_VAULTS_STORAGE = 'GET_VAULTS_STORAGE'
export const getLoansStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    tokens: { dipDupMapper, mTokens },
    wallet: {
      accountPkh,
      user: { userMTokens },
    },
    dataFeeds: { feedsLedger },
  } = getState()
  try {
    const [marketsStorage, vaultsStorage] = await Promise.all([
      fetchFromIndexer(LOANS_QUERY, LOANS_QUERY_NAME, LOANS_QUERY_VARIABLE),
      fetchFromIndexer(VAULTS_STORAGE_QUERY, VAULTS_STORAGE_QUERY_NAME, VAULTS_STORAGE_QUERY_VARIABLE),
    ])

    const normalizedLoansStorage = await normalizeLoans({
      storage: marketsStorage?.lending_controller?.[0],
      dipDupData: dipDupMapper,
      mTokens,
      userMTokens,
      userAddres: accountPkh,
      feeds: feedsLedger,
    })

    const normallaziedVaultsStorage = await normalizeVaultsStorage({
      lendingController: vaultsStorage?.lending_controller[0],
      accountPkh,
      dipDupMapper,
      feeds: feedsLedger,
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
export const getAvaliableCollaterals = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    tokens: { dipDupMapper },
    dataFeeds: { feedsLedger },
  } = getState()
  try {
    const storage = await fetchFromIndexer(
      AVALIABLE_COLLATERALS_QUERY,
      AVALIABLE_COLLATERALS_QUERY_NAME,
      AVALIABLE_COLLATERALS_QUERY_VARIABLE,
    )

    const avaliableCollaterals = getCollateralTokens(
      storage?.lending_controller?.[0]?.collateral_tokens,
      dipDupMapper,
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

export const GET_XTZ_BAKERS = 'GET_XTZ_BAKERS'
export const getXtzBakers = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const xtzBakers = await getXTZBakers()

    await dispatch({
      type: GET_XTZ_BAKERS,
      xtzBakers,
    })
  } catch (e) {
    console.log('getXtzBakers error: ', e)
  }
}

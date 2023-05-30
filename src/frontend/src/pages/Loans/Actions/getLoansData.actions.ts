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
export const getLoansStorage =
  (feedsLedger: DataFeedsContext['feedsMapper']) => async (dispatch: AppDispatch, getState: GetState) => {
    const {
      tokens: { dipDupTokens, mTokens },
      wallet: {
        accountPkh,
        user: { userMTokens },
      },
    } = getState()
    try {
      const [marketsStorage, vaultsStorage] = await Promise.all([
        fetchFromIndexer(LOANS_QUERY, LOANS_QUERY_NAME, LOANS_QUERY_VARIABLE),
        fetchFromIndexer(VAULTS_STORAGE_QUERY, VAULTS_STORAGE_QUERY_NAME, VAULTS_STORAGE_QUERY_VARIABLE),
      ])

      const normalizedLoansStorage = await normalizeLoans({
        storage: marketsStorage?.lending_controller?.[0],
        dipDupData: dipDupTokens,
        mTokens,
        userMTokens,
        userAddres: accountPkh,
        feeds: feedsLedger,
      })

      const normallaziedVaultsStorage = await normalizeVaultsStorage({
        lendingController: vaultsStorage?.lending_controller[0],
        accountPkh,
        dipDupTokens,
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

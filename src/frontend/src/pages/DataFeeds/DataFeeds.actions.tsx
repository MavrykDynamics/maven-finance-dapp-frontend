import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR } from 'app/App.components/Toaster/Toaster.constants'
import { State } from 'reducers'
import { ORACLE_STORAGE_QUERY, ORACLE_STORAGE_QUERY_NAME, ORACLE_STORAGE_QUERY_VARIABLE } from 'gql/queries'
import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import type { AppDispatch, GetState } from '../../app/App.controller'
import { normalizeFeeds } from './DataFeeds.helpers'

export const GET_FEEDS_STORAGE = 'GET_FEEDS_STORAGE'
export const getFeedsStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const feeds = await fetchFromIndexer(ORACLE_STORAGE_QUERY, ORACLE_STORAGE_QUERY_NAME, ORACLE_STORAGE_QUERY_VARIABLE)

    const normalizedFeedsStorage = normalizeFeeds(feeds)

    dispatch({ type: GET_FEEDS_STORAGE, normalizedFeedsStorage })
  } catch (error) {
    console.error('getFeedsStorage: ', error)
  }
}

export const REGISTER_FEED = 'REGISTER_FEED'
export const registerFeedAction = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActiveFullScreenLoader) {
    dispatch(showToaster(ERROR, 'Cannot register feed', ''))
    return
  }

  try {
    // TODO: Implement this action
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}

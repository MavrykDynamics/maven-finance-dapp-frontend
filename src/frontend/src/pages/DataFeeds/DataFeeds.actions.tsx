import { toggleActionFullScreenLoader, toggleActionCompletion } from 'app/App.components/Loader/Loader.action'
import { hideToaster, showToaster } from 'app/App.components/Toaster/Toaster.actions'

import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'
import { normalizeFeeds } from './DataFeeds.helpers'

import {
  ACTION_COMPLETION_MESSAGE_TEXT,
  ACTION_START_MESSAGE_TEXT,
  TOASTER_ERROR,
  TOASTER_INFO,
  TOASTER_LOADING,
  TOASTER_SUCCESS,
  TOASTER_UPDATE_DATA_AFTER_ACTION_DATA,
} from 'app/App.components/Toaster/Toaster.constants'
import { ORACLE_STORAGE_QUERY, ORACLE_STORAGE_QUERY_NAME, ORACLE_STORAGE_QUERY_VARIABLE } from 'gql/queries'

import { State } from 'reducers'
import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import type { AppDispatch, GetState } from '../../app/App.controller'

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
    await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  try {
    // TODO: Implement this action
    // prepare and send transaction

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'registering feed ...', ACTION_START_MESSAGE_TEXT))

    // turn off fs actions loader and start data updating after 5s after operation started
    setTimeout(async () => {
      await dispatch(toggleActionFullScreenLoader(false))
      await dispatch(
        showToaster(
          TOASTER_LOADING,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
        ),
      )

      // @ts-ignore don't have proper type to acees data, type has only methods
      const currentOperationLevel = 0 //transaction?.lastHead?.header?.level

      // refetch data we need
      await checkIndexerLevelAndRunDataUpdateCallback({
        callback: async () => {
          // Add here call for update data actions
          await dispatch(hideToaster())
          await dispatch(showToaster(TOASTER_SUCCESS, 'Feed registered.', ACTION_COMPLETION_MESSAGE_TEXT))
          await dispatch(toggleActionCompletion(false))
        },
        currentOperationLevel,
      })
    }, 5000)
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
    }

    dispatch(toggleActionFullScreenLoader(false))
    dispatch(toggleActionCompletion(false))
  }
}

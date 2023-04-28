import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { toggleActionCompletion, toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { hideToaster, showToaster } from 'app/App.components/Toaster/Toaster.actions'

import {
  ACTION_COMPLETION_MESSAGE_TEXT,
  ACTION_START_MESSAGE_TEXT,
  TOASTER_ERROR,
  TOASTER_INFO,
  TOASTER_LOADING,
  TOASTER_SUCCESS,
  TOASTER_UPDATE_DATA_AFTER_ACTION_DATA,
} from 'app/App.components/Toaster/Toaster.constants'
import {
  FINANCIAL_REQUESTS_STORAGE_QUERY,
  FINANCIAL_REQUESTS_STORAGE_QUERY_NAME,
  FINANCIAL_REQUESTS_STORAGE_QUERY_VARIABLE,
} from 'gql/queries/getFinancialRequestStorage'

import { AppDispatch, GetState } from 'app/App.controller'
import { State } from 'reducers'
import { fetchFromIndexer } from 'gql/fetchGraphQL'

import { normalizeFinancialRequests } from './FinancialRequests.helpers'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'

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

    const { financialRequestMapper, financialRequestsIds } = normalizeFinancialRequests(storage, dipDupTokens)

    dispatch({
      type: GET_FINANCIAL_REQUEST_STORAGE,
      financialRequestMapper,
      financialRequestsIds,
    })
  } catch (error) {
    dispatch(showToaster(TOASTER_ERROR, 'Error while loading financial requests', 'Please try to reload page'))
  }
}

export const votingFinancialRequestVote =
  (vote: string, requestId: number) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.governanceFinancialAddress.address)
      const transaction = await contract?.methods.voteForRequest(requestId, vote).send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Voting...', ACTION_START_MESSAGE_TEXT))

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
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // refetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            await dispatch(getFinancialRequestStorage())

            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Voting done', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        await dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import {
  ACTION_START_MESSAGE_TEXT,
  TOASTER_ERROR,
  TOASTER_INFO,
  TOASTER_LOADING,
  TOASTER_UPDATE_DATA_AFTER_ACTION_DATA,
} from 'app/App.components/Toaster/Toaster.constants'
import { State } from 'reducers'
import type { AppDispatch, GetState } from 'app/App.controller'

import { toggleActionFullScreenLoader, toggleActionCompletion } from 'app/App.components/Loader/Loader.action'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'

export const stake = (amount: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  // check whether we can send transaction
  if (!state.wallet.accountPkh) {
    dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (!(amount > 0)) {
    dispatch(showToaster(TOASTER_ERROR, 'Incorrect amount', 'Please enter an amount superior to zero'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const mvkTokenContract = await tezos?.wallet.at(state.contractAddresses.mvkTokenAddress.address)
    const doormanContract = await tezos?.wallet.at(state.contractAddresses.doormanAddress.address)

    const addOperators = [
        {
          add_operator: {
            owner: state.wallet.accountPkh,
            operator: state.contractAddresses.doormanAddress.address,
            token_id: 0,
          },
        },
      ],
      removeOperators = [
        {
          remove_operator: {
            owner: state.wallet.accountPkh,
            operator: state.contractAddresses.doormanAddress.address,
            token_id: 0,
          },
        },
      ]

    const batch =
      mvkTokenContract &&
      doormanContract &&
      (await tezos.wallet
        .batch()
        .withContractCall(mvkTokenContract.methods.update_operators(addOperators))
        .withContractCall(doormanContract.methods.stake(convertNumberForContractCall({ number: amount })))
        .withContractCall(mvkTokenContract.methods.update_operators(removeOperators)))
    const transaction = await batch?.send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Staking...', ACTION_START_MESSAGE_TEXT))

    // turn off fs actions loader and start data updating after 5s after operation started
    setTimeout(async () => {
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(
        showToaster(
          TOASTER_LOADING,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
        ),
      )

      // @ts-ignore don't have proper type to acees data, type has only methods
      const currentOperationLevel = transaction?.lastHead?.header?.level

      // refetch data we need
      // await checkIndexerLevelAndRunDataUpdateCallback({
      //   callback: async () => {
      //     // await dispatch(updateUserData())
      //     // await dispatch(getDoormanStorage())

      //     // Add here call for update data actions
      //     await dispatch(hideToaster())
      //     await dispatch(showToaster(TOASTER_SUCCESS, 'Staking done', ACTION_COMPLETION_MESSAGE_TEXT))
      //     await dispatch(toggleActionCompletion(false))
      //   },
      //   currentOperationLevel,
      // })
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

export const unstake = (amount: number) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (!(amount > 0)) {
    dispatch(showToaster(TOASTER_ERROR, 'Incorrect amount', 'Please enter an amount superior to zero'))
    return
  }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.doormanAddress.address)
    const transaction = await contract?.methods.unstake(convertNumberForContractCall({ number: amount })).send()

    dispatch(toggleActionFullScreenLoader(true))
    dispatch(toggleActionCompletion(true))
    dispatch(showToaster(TOASTER_INFO, 'Unstaking...', ACTION_START_MESSAGE_TEXT))

    // turn off fs actions loader and start data updating after 5s after operation started
    setTimeout(async () => {
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(
        showToaster(
          TOASTER_LOADING,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
        ),
      )

      // @ts-ignore don't have proper type to acees data, type has only methods
      const currentOperationLevel = transaction?.lastHead?.header?.level

      // refetch data we need
      // await checkIndexerLevelAndRunDataUpdateCallback({
      //   callback: async () => {
      //     // await dispatch(updateUserData())
      //     // await dispatch(getDoormanStorage())

      //     // Add here call for update data actions
      //     await dispatch(hideToaster())
      //     await dispatch(showToaster(TOASTER_SUCCESS, 'Unstaking done', ACTION_COMPLETION_MESSAGE_TEXT))
      //     await dispatch(toggleActionCompletion(false))
      //   },
      //   currentOperationLevel,
      // })
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

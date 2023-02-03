import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { AppDispatch, GetState } from 'app/App.controller'
import { State } from 'reducers'
import { getLoansStorage } from './getLoansData.actions'

export const changeBakerAction =
  (bakerAddress: string, callback: () => void) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (state.loading.isActionLoading) {
      await dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
      return
    }

    try {
      // prepare and send query
      const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.vaultFactory.address)

      const transaction = await contract?.methods.delegateTezToBaker(bakerAddress).send()

      callback()
      await dispatch(toggleActionLoader(true))
      await dispatch(showToaster(INFO, 'Borrowing from the vault...', 'Please wait 30s'))

      // confirm query completion
      await transaction?.confirmation()

      await dispatch(showToaster(SUCCESS, 'Asset borrowed.', 'All good :)'))
      // refetch data we need
      await dispatch(getLoansStorage())
      await dispatch(toggleActionLoader(false))
    } catch (error) {
      console.error('changeBakerAction error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        callback()
      }
      await dispatch(toggleActionLoader(false))
    }
  }

export const managePermissionsAction = (callback: () => void) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    await dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActionLoading) {
    await dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    // prepare and send query
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.lendingController.address)
    // const transaction  = await contract?.methods.any.send()

    callback()
    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Borrowing from the vault...', 'Please wait 30s'))

    // confirm query completion
    // await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Asset borrowed.', 'All good :)'))
    // refetch data we need
    await dispatch(getLoansStorage())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    console.error('borrowVaultAssetAction error:', error)
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
      callback()
    }
    await dispatch(toggleActionLoader(false))
  }
}

export const updateOperatorsAction = (callback: () => void) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    await dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActionLoading) {
    await dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    // prepare and send query
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.lendingController.address)
    // const transaction  = await contract?.methods.any.send()

    callback()
    await dispatch(toggleActionLoader(true))
    await dispatch(showToaster(INFO, 'Borrowing from the vault...', 'Please wait 30s'))

    // confirm query completion
    // await transaction?.confirmation()

    await dispatch(showToaster(SUCCESS, 'Asset borrowed.', 'All good :)'))
    // refetch data we need
    await dispatch(getLoansStorage())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    console.error('borrowVaultAssetAction error:', error)
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
      callback()
    }
    await dispatch(toggleActionLoader(false))
  }
}

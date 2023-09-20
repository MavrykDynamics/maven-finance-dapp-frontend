export async function getContractBigmapKeys(contractAddress: string, name: string) {
  return await (
    await fetch(`${process.env.REACT_APP_TZKT_API}/v1/contracts/${contractAddress}/bigmaps/${name}/keys`)
  ).json()
}

export async function getContractStorage(contractAddress: string) {
  return await (await fetch(`${process.env.REACT_APP_TZKT_API}/v1/contracts/${contractAddress}/storage`)).json()
}

export async function getChainInfo() {
  return await (await fetch(`${process.env.REACT_APP_TZKT_API}/v1/head`)).json()
}

// action boilerplate
/*
  export const actionBoilerplate = () => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    // check whether we can send transaction
    if (!state.wallet.accountPkh) {
      await dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction

      //callback() if we need to do some outside of the action after action fire
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Borrowing from the vault...', ACTION_START_MESSAGE_TEXT))

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
            // Add here call for update data actions
            await dispatch(hideToaster())
            await dispatch(showToaster(TOASTER_SUCCESS, 'Asset borrowed.', ACTION_COMPLETION_MESSAGE_TEXT))
            await dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
      }, 5000)
    } catch (error) {
      console.error('actionBoilerplate error:', error)
      if (error instanceof Error) {
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
        callback()
      }
     dispatch(toggleActionFullScreenLoader(false))
    dispatch(toggleActionCompletion(false))
    }
  }
*/

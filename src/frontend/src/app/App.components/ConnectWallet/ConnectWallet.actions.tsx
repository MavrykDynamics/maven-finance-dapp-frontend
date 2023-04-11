import { AppDispatch, GetState } from 'app/App.controller'

import { showToaster } from '../Toaster/Toaster.actions'
import { updateUserData } from 'reducers/actions/user.actions'
import { dappClient } from 'reducers/wallet/WalletCore'

import { ERROR } from '../Toaster/Toaster.constants'
import { getAvaliableCollaterals } from 'pages/Loans/Actions/getLoansData.actions'

// Instance of Dapp wallet
export const DAPP_INSTANCE = dappClient()

// Wallet action types
export const CONNECT = 'CONNECT'
export const DISCONNECT = 'DISCONNECT'

// Action to change wallet
export const changeWallet = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state = getState()
  try {
    const accountAddress = await DAPP_INSTANCE.swapAccount()

    // If they are equal wallet changed, need to update user data
    if (accountAddress && accountAddress !== state.wallet.accountPkh) {
      await dispatch({
        type: CONNECT,
        accountPkh: accountAddress,
      })

      await dispatch(updateUserData())
      await dispatch(getAvaliableCollaterals())
    }
  } catch (e) {
    console.error(`Failed to change wallet: `, e)
    if (e instanceof Error) {
      dispatch(showToaster(ERROR, 'Failed to change wallet', e.message))
    }
  }
}

// Action to connect wallet
export const connect = () => async (dispatch: AppDispatch, getState: GetState) => {
  try {
    const account = await DAPP_INSTANCE.connectAccount()

    // if choosen wallet in popup
    if (account) {
      await dispatch({
        type: CONNECT,
        accountPkh: account.address,
      })

      await dispatch(updateUserData())
    } else {
      throw new Error('No account choosen')
    }
  } catch (e) {
    console.error(`Failed to connect wallet:`, e)
    if (e instanceof Error) {
      dispatch(showToaster(ERROR, `Failed to connect wallet:`, e.message))
    }
  }
}

// Action to disconnect wallet
export const disconnect = () => async (dispatch: AppDispatch) => {
  try {
    await dappClient().disconnectWallet()

    // Clear user data in redux
    await dispatch({ type: DISCONNECT })
  } catch (e) {
    console.error(`Failed to disconnect TempleWallet: `, e)
    if (e instanceof Error) {
      dispatch(showToaster(ERROR, 'Failed to disconnect TempleWallet', e.message))
    }
  }
}

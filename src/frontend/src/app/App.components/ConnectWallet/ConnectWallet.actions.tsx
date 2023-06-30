import { AppDispatch, GetState } from 'app/App.controller'

import { showToaster } from '../Toaster/Toaster.actions'
import { dappClient } from 'providers/UserProvider/wallet/WalletCore'

import { ERROR } from '../Toaster/Toaster.constants'
import { getLoansStorage } from 'pages/Loans/Actions/getLoansData.actions'
import { SET_REDUX_USER } from 'reducers/wallet'

// Instance of Dapp wallet
export const DAPP_INSTANCE = dappClient()

// Wallet action types
export const DISCONNECT = 'DISCONNECT'

// Action to change wallet
export const changeWallet = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state = getState()
  try {
    const accountAddress = await DAPP_INSTANCE.swapAccount()

    // If they are equal wallet changed, need to update user data
    if (accountAddress && accountAddress !== state.wallet.accountPkh) {
      dispatch({ type: SET_REDUX_USER, accountPkh: accountAddress })

      // Update loans data on wallet manipulations if it's loaded, cuz it's user centric data
      if (state.loans.isDataLoaded) await dispatch(getLoansStorage())
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
  const state = getState()
  try {
    const accountAddress = await DAPP_INSTANCE.connectAccount()

    // if choosen wallet in popup
    if (accountAddress) {
      dispatch({ type: SET_REDUX_USER, accountPkh: accountAddress })

      // Update loans data on wallet manipulations if it's loaded, cuz it's user centric data
      if (state.loans.isDataLoaded) await dispatch(getLoansStorage())
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
export const disconnect = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state = getState()
  try {
    await dappClient().disconnectWallet()

    // Clear user data in redux
    await dispatch({ type: DISCONNECT })

    // Update loans data on wallet manipulations if it's loaded, cuz it's user centric data
    if (state.loans.isDataLoaded) await dispatch(getLoansStorage())
  } catch (e) {
    console.error(`Failed to disconnect TempleWallet: `, e)
    if (e instanceof Error) {
      dispatch(showToaster(ERROR, 'Failed to disconnect TempleWallet', e.message))
    }
  }
}

import { BeaconWallet } from '@taquito/beacon-wallet'
import { Network, NetworkType } from '@airgap/beacon-sdk'
import { TezosToolkit } from '@taquito/taquito'
import { AppDispatch, GetState } from 'app/App.controller'
import { showToaster } from '../Toaster/Toaster.actions'
import { ERROR } from '../Toaster/Toaster.constants'
import { fetchUserData, updateUserData } from 'pages/Doorman/Doorman.actions'
import { DEFAULT_USER } from 'reducers/wallet'
import { CLEAR_LOANS_STORAGE, getLoansStorage } from 'pages/Loans/Actions/getLoansData.actions'

export const CHANGE_WALLET = 'CHANGE_WALLET'
export const changeWallet = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    wallet: { wallet },
    preferences: { REACT_APP_RPC_PROVIDER },
  } = getState()
  try {
    if (wallet) {
      // getting current wallet
      const prevWalletAccount = await wallet.client.getActiveAccount()

      //clearing wallet logged in
      await wallet.client.clearActiveAccount()

      try {
        // triggering popups for wallet selection
        // await wallet.requestPermissions({
        //   network: { type: NetworkType.GHOSTNET },
        // })

        await wallet.requestPermissions()
      } catch (e) {
        console.warn('selecting wallet error', e)
      }

      // getting newly selected vault
      const newAccount = await wallet.client.getActiveAccount()

      console.log({ newAccount, prevWalletAccount, type: { type: NetworkType.GHOSTNET }, NetworkType })

      if (newAccount) {
        // setting newly selected wallet
        await wallet.client.setActiveAccount(newAccount)
        console.log('1', { wallet, client: wallet.client })
        const newTezos = new TezosToolkit(REACT_APP_RPC_PROVIDER)
        console.log('2', { wallet, client: wallet.client })
        await newTezos.setRpcProvider(REACT_APP_RPC_PROVIDER)
        console.log('3', { wallet, client: wallet.client })
        await newTezos.setWalletProvider(wallet)
        console.log('4', { wallet, client: wallet.client })

        dispatch({
          type: CHANGE_WALLET,
          wallet,
          tezos: newTezos,
          accountPkh: newAccount.address,
        })
        await dispatch(updateUserData())
        await dispatch(updateWalletDependedDataOnWalletChange())
        console.log('5')
      } else {
        await wallet.client.setActiveAccount(prevWalletAccount)
      }

      console.log('after seting')
    }
  } catch (e) {
    console.error(`Failed to change wallet: `, e)
    if (e instanceof Error) {
      dispatch(showToaster(ERROR, 'Failed to change wallet', e.message))
    }
  }
}

export const CONNECT = 'CONNECT'
export const connect = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state = getState()
  try {
    // getting userWallet data
    const rpcNetwork = state.preferences.REACT_APP_RPC_PROVIDER
    const wallet = new BeaconWallet({
      name: process.env.REACT_APP_NAME || 'MAVRYK',
      preferredNetwork: NetworkType.GHOSTNET,
    })
    const walletResponse = await checkIfWalletIsConnected(wallet)

    if (walletResponse.success) {
      const Tezos = new TezosToolkit(rpcNetwork)
      let account = await wallet.client.getActiveAccount()
      if (!account) {
        await wallet.client.requestPermissions({
          network: { type: NetworkType.GHOSTNET },
        })
        account = await wallet.client.getActiveAccount()
      }

      await Tezos.setRpcProvider(rpcNetwork)
      await Tezos.setWalletProvider(wallet)

      const accountPkh = account?.address

      // getting userData
      const userData = accountPkh
        ? await fetchUserData(
            accountPkh,
            state.delegation.delegationStorage.activeSatellites,
            state.tokens.dipDupTokens,
            state.oracles.oraclesStorage.feeds,
            state.preferences.headData?.level,
          )
        : DEFAULT_USER

      await dispatch({
        type: CONNECT,
        wallet,
        tezos: Tezos,
        userData,
        accountPkh,
      })
    }
  } catch (e) {
    console.error(`Failed to connect wallet:`, e)
    if (e instanceof Error) {
      dispatch(showToaster(ERROR, `Failed to connect wallet:`, e.message))
    }
  }
}

export const updateWalletDependedDataOnWalletChange = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state = getState()
  try {
    // TODO: check how many data will be refetched, mb consider update only data related to the current page
    if (state.loans.isDataLoaded) {
      await dispatch({ type: CLEAR_LOANS_STORAGE })
      await dispatch(getLoansStorage())
    }
  } catch (e) {
    console.error(`Failed to updateWalletDependedDataOnWalletChange: `, e)
  }
}

export const DISCONNECT = 'DISCONNECT'
export const disconnect = () => async (dispatch: AppDispatch, getState: GetState) => {
  const state = getState()
  try {
    await state.wallet.wallet?.client.clearActiveAccount()
    await state.wallet.wallet?.disconnect()

    await dispatch({ type: DISCONNECT })
    await dispatch(updateWalletDependedDataOnWalletChange())
  } catch (e) {
    console.error(`Failed to disconnect TempleWallet: `, e)
    if (e instanceof Error) {
      dispatch(showToaster(ERROR, 'Failed to disconnect TempleWallet', e.message))
    }
  }
}

export const checkIfWalletIsConnected = async (wallet: any) => {
  try {
    const activeAccount = await wallet.client.getActiveAccount()
    if (!activeAccount) {
      await wallet.client.requestPermissions({
        network: { type: NetworkType.GHOSTNET },
      })
    }
    return {
      success: true,
    }
  } catch (e) {
    // The user is not connected. A button should be displayed where the user can connect to his wallet.
    return { success: false, e }
  }
}

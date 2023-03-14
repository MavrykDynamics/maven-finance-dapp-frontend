import { BeaconWallet } from '@taquito/beacon-wallet'
import { NetworkType } from '@airgap/beacon-sdk'
import { AppDispatch, GetState } from 'app/App.controller'
import { showToaster } from '../Toaster/Toaster.actions'
import { ERROR } from '../Toaster/Toaster.constants'
import { DEFAULT_USER } from 'reducers/wallet'
import { CLEAR_LOANS_STORAGE, getLoansStorage } from 'pages/Loans/Actions/getLoansData.actions'
import { CLEAR_MY_COUNCIL_ACTIONS } from 'pages/Council/Council.actions'
import { CLEAR_MY_BREAK_GLASS_COUNCIL_ACTIONS } from 'pages/BreakGlassCouncil/BreakGlassCouncil.actions'
import { fetchUserData, updateUserData } from 'reducers/actions/user.actions'

const WALLET_INSTANCE = new BeaconWallet({
  name: process.env.REACT_APP_NAME || 'MAVRYK',
  preferredNetwork: NetworkType.GHOSTNET,
})

export const CHANGE_WALLET = 'CHANGE_WALLET'
export const changeWallet = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    wallet: { wallet, tezos },
  } = getState()
  try {
    if (wallet && tezos) {
      // getting current wallet
      const prevWalletAccount = await wallet.client.getActiveAccount()

      // clearing wallet logged in
      await wallet.client.clearActiveAccount()

      try {
        // triggering popups for wallet selection
        await wallet.client.requestPermissions({
          network: { type: NetworkType.GHOSTNET },
        })
      } catch (e) {
        console.error('selecting wallet error', e)
      }

      // getting newly selected vault
      const newAccount = await wallet.client.getActiveAccount()

      if (newAccount) {
        // setting newly selected wallet
        await wallet.client.setActiveAccount(newAccount)
        await tezos.setWalletProvider(wallet)

        await dispatch({
          type: CHANGE_WALLET,
          accountPkh: newAccount.address,
        })

        await dispatch(updateUserData())
        await dispatch(updateWalletDependedDataOnWalletChange())
      } else {
        await wallet.client.setActiveAccount(prevWalletAccount)
        await tezos.setWalletProvider(wallet)
      }
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
  const {
    preferences: { headData },
    tokens: { dipDupTokens },
    dataFeeds: { feedsLedger },
    wallet: { tezos },
  } = getState()

  try {
    // checking whether we have user from last session in local storage
    const activeAcc = await WALLET_INSTANCE?.client.getActiveAccount()

    // if we don't have user from last session request to select wallet
    if (!activeAcc) {
      await WALLET_INSTANCE.client.clearActiveAccount()
      await WALLET_INSTANCE.client.requestPermissions({
        network: { type: NetworkType.GHOSTNET },
      })
    }
    // getting address of the wallet to load data
    const { address } = activeAcc ? activeAcc : (await WALLET_INSTANCE?.client.getActiveAccount()) ?? {}

    // set upping tezos instance
    await tezos.setWalletProvider(WALLET_INSTANCE)

    // getting userData
    const userData = address ? await fetchUserData(address, dipDupTokens, feedsLedger, headData?.level) : DEFAULT_USER

    await dispatch({
      type: CONNECT,
      wallet: WALLET_INSTANCE,
      userData,
      accountPkh: address,
    })

    // updating sections that are loaded and depends on user's wallet
    await dispatch(updateWalletDependedDataOnWalletChange())
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

    if (state.council.isCouncilPendingActionsLoaded || state.council.isCouncilPastActionsLoaded) {
      await dispatch({ type: CLEAR_MY_COUNCIL_ACTIONS })
    }

    if (state.council.isBreakGlassCouncilPendingActionsLoaded || state.council.isBreakGlassCouncilPastActionsLoaded) {
      await dispatch({ type: CLEAR_MY_BREAK_GLASS_COUNCIL_ACTIONS })
    }
  } catch (e) {
    console.error(`Failed to updateWalletDependedDataOnWalletChange: `, e)
  }
}

export const DISCONNECT = 'DISCONNECT'
export const disconnect = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    wallet: { wallet },
  } = getState()
  try {
    if (wallet) {
      await wallet.client.clearActiveAccount()
      await wallet.disconnect()

      await dispatch({ type: DISCONNECT })
      await dispatch(updateWalletDependedDataOnWalletChange())
    }
  } catch (e) {
    console.error(`Failed to disconnect TempleWallet: `, e)
    if (e instanceof Error) {
      dispatch(showToaster(ERROR, 'Failed to disconnect TempleWallet', e.message))
    }
  }
}

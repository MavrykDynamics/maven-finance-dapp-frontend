import { Network, NetworkType } from '@airgap/beacon-sdk'
import type { BeaconWallet as BeaconWalletType } from '@taquito/beacon-wallet'
import { BeaconWallet } from '@taquito/beacon-wallet'
import { TezosToolkit } from '@taquito/taquito'
import { RPC_NODE, ecadLabSUrl } from 'providers/DappConfigProvider/helpers/dappConfig.const'
import { getItemFromStorage } from 'utils/storage'

export const WALLET_NETWORK: Network['type'] = NetworkType.GHOSTNET
const DAPP_METADATA = {
  name: process.env.REACT_APP_NAME || 'MAVRYK',
  preferredNetwork: WALLET_NETWORK,
}

const getRpcNode = () => {
  const rpcNode = getItemFromStorage(RPC_NODE) ?? ecadLabSUrl
  return rpcNode
}

export function dappClient() {
  let instance: BeaconWalletType | undefined

  function init() {
    return new BeaconWallet(DAPP_METADATA)
  }

  function loadWallet() {
    if (!instance) instance = init()
    return instance
  }

  function getDAppClient() {
    return loadWallet().client
  }

  function getDAppClientWallet() {
    return loadWallet()
  }

  async function connectAccount() {
    try {
      const client = getDAppClient()
      const account = await client.getActiveAccount()

      if (!account) {
        await client.requestPermissions({
          network: {
            type: WALLET_NETWORK,
            rpcUrl: getRpcNode(),
          },
        })
        return (await client.getActiveAccount())?.address
      }

      return account?.address
    } catch (error) {
      console.log('connectAccount error:', error)
      throw error
    }
  }

  async function swapAccount() {
    try {
      const client = getDAppClient()

      const currentAccount = await client.getActiveAccount()
      let newAccount

      // if user has connected wallet we can change it
      if (currentAccount) {
        try {
          // Clear connected wallet
          await client.clearActiveAccount()

          // Call beakon popup to choose new wallet
          await client.requestPermissions({
            network: {
              type: WALLET_NETWORK,
              rpcUrl: getRpcNode(),
            },
          })

          // Choosen wallet in popup
          newAccount = await client.getActiveAccount()

          // Update dapp instance wallet with newly selected one
          await client.setActiveAccount(newAccount)
        } catch (e) {
          // If no wallet choosen set back prev selected wallet to dapp instance
          await client.setActiveAccount(currentAccount)
          console.log('choosing wallet error: ', e)
        }
      }

      // Return new wallet address if it was selected or prev selected wallet address
      return newAccount?.address ?? currentAccount?.address
    } catch (error) {
      console.log('swapAccount error:', error)
      throw error
    }
  }

  function tezos() {
    const wallet = getDAppClientWallet()
    const Tezos = new TezosToolkit(getRpcNode())

    if (wallet) Tezos.setWalletProvider(wallet)

    return Tezos
  }

  async function disconnectWallet() {
    try {
      const wallet = getDAppClientWallet()
      await wallet.disconnect()
      await wallet.clearActiveAccount()
    } catch (error) {
      console.log('disconnectWallet error:', error)
      throw error
    }
  }

  return {
    loadWallet,
    getDAppClient,
    connectAccount,
    swapAccount,
    tezos,
    disconnectWallet,
  }
}

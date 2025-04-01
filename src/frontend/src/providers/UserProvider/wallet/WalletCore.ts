import { BeaconWallet } from '@mavrykdynamics/taquito-beacon-wallet'
import { NetworkType } from '@mavrykdynamics/beacon-dapp'
import { MavrykToolkit } from '@mavrykdynamics/taquito'
import type { BeaconWallet as BeaconWalletType } from '@mavrykdynamics/taquito-beacon-wallet'

// MAINNET = "mainnet",
// BASENET = "basenet",
// WEEKLYNET = "weeklynet",
// DAILYNET = "dailynet",
// ATLASNET = "atlasnet",
// CUSTOM = "custom"
// consts
import { RPCNodeType, atlasNetRpcnode, rpcNodeSchema } from 'consts/rpcNodes.const'
import { RPC_NODE } from 'providers/DappConfigProvider/helpers/dappConfig.const'

// utils
import { getItemFromStorage } from 'utils/storage'

// Need to use as cuz NetworkType is enum and ts don't understand that all types are correct
const WALLET_NETWORK = process.env.REACT_APP_NETWORK as NetworkType
const DAPP_METADATA = {
  name: process.env.REACT_APP_NAME,
  preferredNetwork: WALLET_NETWORK,
}

const getRpcNode = (): RPCNodeType => {
  const rpcNode = getItemFromStorage<RPCNodeType>(RPC_NODE, rpcNodeSchema) ?? atlasNetRpcnode
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
    const Tezos = new MavrykToolkit(getRpcNode())

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

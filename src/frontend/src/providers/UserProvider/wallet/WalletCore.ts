import { MavletWallet } from '@mavrykdynamics/webmavryk-mavlet-wallet'
import { NetworkType } from '@mavrykdynamics/mavlet-dapp'
import { MavrykToolkit } from '@mavrykdynamics/webmavryk'
import type { MavletWallet as MavletWalletType } from '@mavrykdynamics/webmavryk-mavlet-wallet'

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
const WALLET_NETWORK = import.meta.env.VITE_NETWORK as NetworkType
const DAPP_METADATA = {
  name: import.meta.env.VITE_NAME,
  preferredNetwork: WALLET_NETWORK,
}

const getRpcNode = (): RPCNodeType => {
  const rpcNode = getItemFromStorage<RPCNodeType>(RPC_NODE, rpcNodeSchema) ?? atlasNetRpcnode
  return rpcNode
}

export function dappClient() {
  let instance: MavletWalletType | undefined

  function init() {
    return new MavletWallet(DAPP_METADATA)
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
      console.error('connectAccount error:', error)
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
          console.error('choosing wallet error: ', e)
        }
      }

      // Return new wallet address if it was selected or prev selected wallet address
      return newAccount?.address ?? currentAccount?.address
    } catch (error) {
      console.error('swapAccount error:', error)
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
      console.error('disconnectWallet error:', error)
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

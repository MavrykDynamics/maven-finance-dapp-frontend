import { z } from 'zod'
// user can add the custom one from the settings popup

// Ecad Labs
export const ecadLabsTezMainnetRpcNode = 'https://mainnet.api.tez.ie/'
export const ecadLabGhostnetRpcNode = 'https://ghostnet.ecadinfra.com' // in use
export const ecadLabNairobinetRpcNode = 'https://nairobinet.ecadinfra.com/'
export const ecadLabMumbainetRpcNode = 'https://mumbainet.ecadinfra.com/'

// Smartpy
export const smartpyMainnetRpcNode = 'https://mainnet.smartpy.io/'
export const smartpyGhostnetRpcNode = ' https://ghostnet.smartpy.io/'

// tezosFoundation
export const tezosFoundationRpcNode = 'https://rpc.tzbeta.net/'

// Marigold
export const marigoldMainnetRpcNode = 'https://mainnet.tezos.marigold.dev/'
export const marigoldGhostnetRpcNode = 'https://ghostnet.tezos.marigold.dev/' // in use
export const marigoldNairobinetRpcNode = 'https://nairobinet.tezos.marigold.dev/'
export const marigoldMumbainetRpcNode = 'https://mumbainet.tezos.marigold.dev/'

// tezTools
export const tezToolsRpcNode = 'https://eu01-node.teztools.net/'

export const atlasNetRpcnode = 'https://atlasnet.rpc.mavryk.network'

export const rpcNodeSchema = z.enum([
  ecadLabsTezMainnetRpcNode,
  ecadLabGhostnetRpcNode,
  ecadLabNairobinetRpcNode,
  ecadLabMumbainetRpcNode,
  smartpyMainnetRpcNode,
  smartpyGhostnetRpcNode,
  tezosFoundationRpcNode,
  marigoldMainnetRpcNode,
  marigoldGhostnetRpcNode,
  marigoldNairobinetRpcNode,
  marigoldMumbainetRpcNode,
  atlasNetRpcnode,
])

export type RPCNodeType = z.infer<typeof rpcNodeSchema>

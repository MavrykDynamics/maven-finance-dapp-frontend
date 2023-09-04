import { z } from 'zod'

export const envVariables = z.object({
  REACT_APP_ENV: z.literal('dev').or(z.literal('prod')),

  REACT_APP_TZKT_API: z.literal('https://api.ghostnet.tzkt.io').or(z.literal('https://api.tzkt.io')),
  REACT_APP_WERT_API: z.literal('https://sandbox.wert.io'),

  REACT_APP_GRAPHQL_API: z.literal('https://api-v2.mavryk.finance/v1/graphql'),
  REACT_APP_GRAPHQL_WSS_API: z.literal('wss://api-v2.mavryk.finance/v1/graphql'),

  REACT_APP_NAME: z.string(),
  REACT_APP_NETWORK: z.literal('mainnet').or(z.literal('ghostnet')),

  IPFS_API_KEY: z.string(),
  IPFS_PROJECT_ID: z.string(),
  NODE_VERSION: z.string(),
})

envVariables.parse(process.env)

import { NetworkType } from '@mavrykdynamics/mavlet-dapp'
import { z } from 'zod'

const envVariablesSchema = z.object({
  REACT_APP_DATA_ENV: z.literal('dev').or(z.literal('prod')),
  REACT_APP_ENV: z.literal('dev').or(z.literal('prod')),

  REACT_APP_TZKT_API: z.literal('https://atlasnet.api.mavryk.network'),
  REACT_APP_TZKT_LINK: z.literal('https://ghostnet.tzkt.io').or(z.literal('https://tzkt.io')),
  REACT_APP_TZKT_SERVICE_API: z.literal('https://services.tzkt.io'),
  REACT_APP_WERT_API: z.literal('https://sandbox.wert.io'),

  REACT_APP_GRAPHQL_API: z.literal('https://api-v2.mavryk.finance/v1/graphql'),
  REACT_APP_GRAPHQL_WSS_API: z.literal('wss://api-v2.mavryk.finance/v1/graphql'),

  REACT_APP_NAME: z.string(),
  REACT_APP_NETWORK: z.literal(NetworkType.MAINNET).or(z.literal(NetworkType.ATLASNET)),

  REACT_APP_IPFS_API_KEY: z.string(),
  REACT_APP_IPFS_PROJECT_ID: z.string(),
  NODE_VERSION: z.string(),
})

envVariablesSchema.parse(process.env)

export type ProcessEnvType = z.infer<typeof envVariablesSchema>

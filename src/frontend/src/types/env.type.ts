import { NetworkType } from '@mavrykdynamics/mavlet-dapp'
import { z } from 'zod'

const envVariablesSchema = z.object({
  VITE_DATA_ENV: z.literal('dev').or(z.literal('prod')),
  VITE_ENV: z.literal('dev').or(z.literal('prod')),

  VITE_TZKT_API: z.literal('https://atlasnet.api.mavryk.network'),
  VITE_TZKT_LINK: z.literal('https://ghostnet.tzkt.io').or(z.literal('https://tzkt.io')),
  VITE_TZKT_SERVICE_API: z.literal('https://services.tzkt.io'),
  VITE_WERT_API: z.literal('https://sandbox.wert.io'),

  VITE_GRAPHQL_API: z.literal('https://api-v2.mavryk.finance/v1/graphql'),
  VITE_GRAPHQL_WSS_API: z.literal('wss://api-v2.mavryk.finance/v1/graphql'),

  VITE_NAME: z.string(),
  VITE_NETWORK: z.literal(NetworkType.MAINNET).or(z.literal(NetworkType.ATLASNET)),

  VITE_IPFS_API_KEY: z.string(),
  VITE_IPFS_PROJECT_ID: z.string(),
})

envVariablesSchema.parse(import.meta.env)

export type ProcessEnvType = z.infer<typeof envVariablesSchema>

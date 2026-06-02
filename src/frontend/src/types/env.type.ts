import { NetworkType } from '@mavrykdynamics/mavlet-dapp'
import { z } from 'zod'

const envVariablesSchema = z.object({
  VITE_DATA_ENV: z.literal('dev').or(z.literal('prod')),
  VITE_ENV: z.literal('dev').or(z.literal('prod')),

  VITE_TZKT_API: z.string().url(),
  VITE_TZKT_LINK: z.string().url(),
  VITE_TZKT_SERVICE_API: z.string().url(),
  VITE_WERT_API: z.string().url(),

  VITE_GRAPHQL_API: z.string().url(),
  VITE_GRAPHQL_WSS_API: z.string().url(),

  VITE_NAME: z.string(),
  VITE_NETWORK: z.literal(NetworkType.MAINNET).or(z.literal(NetworkType.ATLASNET)),

  VITE_IPFS_API_KEY: z.string(),
  VITE_IPFS_PROJECT_ID: z.string(),
  VITE_EXPLORER_LINK: z.string().url().optional(),
})

envVariablesSchema.parse(import.meta.env)

export type ProcessEnvType = z.infer<typeof envVariablesSchema>

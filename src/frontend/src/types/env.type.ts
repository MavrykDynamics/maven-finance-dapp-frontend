import { z } from 'zod'

const envVariables = z.object({
  INLINE_RUNTIME_CHUNK: z.string(),
  NODE_ENV: z.string(),
  REACT_APP_BUILD_ENV: z.string(),
  PORT: z.string(),
  REACT_APP_RECAPTCHA_SITE_KEY: z.string(),
  REACT_APP_NAME: z.string(),
  REACT_APP_NETWORK: z.string(),
  REACT_APP_API_NETWORK: z.string(),
  REACT_APP_ADMIN: z.string(),
  REACT_APP_RPC_TZKT_API: z.string(),
  REACT_APP_GRAPHQL_API: z.string(),
  REACT_APP_GRAPHQL_WSS_API: z.string(),
  REACT_APP_DEV_GRAPHQL_API: z.string(),
  REACT_APP_BACKUP_GRAPHQL_API: z.string(),
  REACT_APP_CHAIN_ID: z.string(),
  WERT_IO_ORIGIN: z.string(),
})

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}

/// <reference types="vite/client" />

/** Build-time constant set by vite.user.config.mts or vite.gov.config.mts */
declare const __APP_MODE__: 'user' | 'gov'

interface ImportMetaEnv {
  readonly VITE_NETWORK: string
  readonly VITE_ENV: string
  readonly VITE_DATA_ENV: string
  readonly VITE_GRAPHQL_API: string
  readonly VITE_TZKT_API: string
  readonly VITE_TZKT_LINK: string
  readonly VITE_NAME: string
  readonly VITE_RECAPTCHA_SITE_KEY: string
  readonly VITE_MAINTANCE_MODE: string
  readonly VITE_PARTNER_SITE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

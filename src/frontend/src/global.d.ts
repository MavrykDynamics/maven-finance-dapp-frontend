export {}

interface ImportMetaEnv {
  readonly VITE_DATA_ENV: 'dev' | 'prod'
  readonly VITE_ENV: 'dev' | 'prod'
  readonly VITE_TZKT_API: string
  readonly VITE_TZKT_LINK: string
  readonly VITE_TZKT_SERVICE_API: string
  readonly VITE_WERT_API: string
  readonly VITE_GRAPHQL_API: string
  readonly VITE_GRAPHQL_WSS_API: string
  readonly VITE_NAME: string
  readonly VITE_NETWORK: 'atlasnet'
  readonly VITE_IPFS_API_KEY: string
  readonly VITE_IPFS_PROJECT_ID: string
  readonly VITE_RECAPTCHA_SITE_KEY?: string
  readonly VITE_MAINTANCE_MODE?: string
  readonly VITE_IS_DEMO?: string
  readonly VITE_EXPLORER_LINK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  type DeepNullable<T> = T extends object
    ? {
        [P in keyof T]: T extends Array<any> ? T[P] : DeepNullable<T[P]> | null
      }
    : T

  type DeepPartial<T> = T extends object
    ? {
        [P in keyof T]?: DeepPartial<T[P]>
      }
    : T

  /**
   * TupleType - some tuple (f.e. "1h" | "24h" |"1")
   * TValue - any value you pass (f.e. string | number | object | array etc.)
   */
  type TupleKeyValueAny<TupleType extends string, TValue> = {
    [key in TupleType]: TValue
  }

  interface Window {
    dataLayer: Array<unknown>
  }
}

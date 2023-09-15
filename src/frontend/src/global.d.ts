export {}

declare global {
  namespace NodeJS {
    // Need to specify types manually, cuz extends ProcessEnvType not working, so keed it updated due to envVariablesSchema
    interface ProcessEnv extends ProcessEnvType {
      REACT_APP_ENV: 'dev' | 'prod'
      REACT_APP_TZKT_API: 'https://api.ghostnet.tzkt.io' | 'https://api.tzkt.io'
      REACT_APP_TZKT_SERVICE_API: 'https://services.tzkt.io'
      REACT_APP_WERT_API: 'https://sandbox.wert.io'
      REACT_APP_GRAPHQL_API: 'https://api-v2.mavryk.finance/v1/graphql'
      REACT_APP_GRAPHQL_WSS_API: 'wss://api-v2.mavryk.finance/v1/graphql'

      REACT_APP_NAME: string
      REACT_APP_NETWORK: 'mainnet' | 'ghostnet'

      IPFS_API_KEY: string
      IPFS_PROJECT_ID: string
      NODE_VERSION: string
    }
  }

  type DeepNullable<T> = {
    [P in keyof T]: T[P] | null
  }

  type DeepNullable<T> = {
    [P in keyof T]: T[P] | null
  }

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
}

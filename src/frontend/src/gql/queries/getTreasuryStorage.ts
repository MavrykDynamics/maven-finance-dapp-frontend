export const GET_TREASURY_DATA = `
query GetTreasuryStorageQuery {
  treasury(where: {admin: {_neq: ""}}) {
    address
    admin
    creation_timestamp
    name
    balances {
      balance
      treasury_id
      token {
        metadata
        token_address
        token_standard
      }
    }
    whitelist_token_contracts {
      contract_address
    }
  }
  treasury_factory {
    address
  }
}
`

export const TREASURY_STORAGE_QUERY_NAME = 'GetTreasuryStorageQuery'
export const TREASURY_STORAGE_QUERY_VARIABLE = {}

export const TREASURY_SMVK_QUERY = `
  query GetsMVKBalances ($addresses: [String!]) {
    mavryk_user(where: {address: {_in: $addresses}}) {
      smvk_balance
      address
    }
  }
`

export const TREASURY_SMVK_QUERY_NAME = 'GetsMVKBalances'
export function TREASURY_SMVK_QUERY_VARIABLES(addresses: Array<string>) {
  /* prettier-ignore */
  return { addresses }
}

import { gql } from 'utils/__generated__'

export const GET_TREASURY_STORAGE_QUERY = gql(`
query GetTreasuryStorageData {
    treasury(where: {admin: {_neq: ""}}) {
      address
      admin
      creation_timestamp
      name
      balances {
        balance
        whitelisted
        token {
          token_address
        }
      }
    }
  }
`)

export const GET_TREASURY_SMVK_BALANCES = gql(`
query GetTreasurySmvkBalances($addresses: [String!] = []) {
  mavryk_user(where: {address: {_in: $addresses}}) {
    smvk_balance
    address
  }
}
`)

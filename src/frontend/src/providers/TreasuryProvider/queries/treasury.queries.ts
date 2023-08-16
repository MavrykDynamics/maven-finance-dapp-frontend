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
  }
`)

export const GET_TREASURY_USER_BALANCES = gql(`
query GetTreasuryUserBalances($addresses: [String!] = []) {
  mavryk_user(where: {address: {_in: $addresses}}) {
    smvk_balance
    address
  }
}
`)

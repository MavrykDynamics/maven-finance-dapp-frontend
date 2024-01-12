import { gql } from 'utils/__generated__'

export const GET_TREASURY_STORAGE_QUERY = gql(`
query GetTreasuryStorageData {
    treasury: treasury(where: {admin: {_neq: ""}}) {
      address
      admin
      creation_timestamp
      name
      balances(where: {whitelisted: {_eq: true}}) {
        balance
        token {
          token_address
        }
      }
    }
  }
`)

export const GET_TREASURY_SMVN_BALANCES = gql(`
query GetTreasurySmvnBalances($addresses: [String!] = []) {
  maven_user: maven_user(where: {address: {_in: $addresses}}) {
    smvn_balance
    address
  }
}
`)

import { gql } from 'utils/__generated__/gql'

export const SUBSCRIPTION_STAKE_HISTORY = gql(`
  subscription subscribeSmvkHistoryData {
    smvk_history_data(distinct_on: timestamp) {
      mvk_total_supply
      smvk_total_supply
      timestamp
    }
  }
`)

export const SUBSCRIPTION_ADDRESS_BALANCE_DATA = gql(`
  subscription subscribeAdressBalance($_eq: String) {
    mavryk_user(where: { address: { _eq: $_eq } }) {
      address
      mvk_balance
      smvk_balance
    }
  }
`)

export const SUBSCRIPTION_MVK_TOKEN_TOTAL = gql(`
subscription subscribeMvkTokenTotal {
  mvk_token {
    total_supply
    maximum_supply
  }
}
`)

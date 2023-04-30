import { gql } from 'utils/__generated__/gql'

export const SUBSCRIPTION_STAKE = gql(/* GraphQL */ `
  subscription subscribeSmvkHistoryData {
    smvk_history_data(distinct_on: timestamp) {
      mvk_total_supply
      smvk_total_supply
      timestamp
    }
  }
  `
)

export const ADDRESS_BALANCE_DATA = gql(/* GraphQL */ `
  subscription subscribeAdressBalance($_eq: String) {
    mavryk_user(where: { address: { _eq: $_eq } }) {
      address
      mvk_balance
      smvk_balance
    }
  }
`)

export const DOORMAN_ADDRESS_BALANCE = gql(/* GraphQL */ `
  subscription subscribeDoormanAddressBalance($doormanContractAddress: String) {
    mavryk_user(where: { address: { _eq: $doormanContractAddress } }) {
      mvk_balance
    }
  }
`)

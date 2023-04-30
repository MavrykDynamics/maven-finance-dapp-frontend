import { gql } from '@apollo/client'

// for doorman -> pass to normalizeSmvkHistoryData
export const SUBSCRIPTION_STAKE = gql`
  subscription subscribeSmvkHistoryData {
    smvk_history_data(distinct_on: timestamp) {
      mvk_total_supply
      smvk_total_supply
      timestamp
    }
  }
`

// for address
export const ADDRESS_BALANCE_DATA = gql`
  subscription subscribeAdressBalance($_eq: String) {
    mavryk_user(where: { address: { _eq: $_eq } }) {
      address
      mvk_balance
      smvk_balance
    }
  }
`
// for doorman normalizeDoormanStorage
export const DOORMAN_ADDRESS_BALANCE = gql`
  subscription subscribeDoormanAddressBalance($doormanContractAddress: String) {
    mavryk_user(where: { address: { _eq: $doormanContractAddress } }) {
      mvk_balance
    }
  }
`

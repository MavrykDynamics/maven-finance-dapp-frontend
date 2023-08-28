import { gql } from 'utils/__generated__/gql'

export const SMVK_MVK_HISTORY_DATA = gql(`
  query smvkMvkHistoryData($periodTimestamp: timestamptz = "1970-01-01T00:00:00.000Z") {
    operationsInPeriod: smvk_history_data(distinct_on: timestamp, where: {timestamp: {_gte: $periodTimestamp}}) {
      mvk_total_supply
      smvk_total_supply
      timestamp
    }
  
  	lastOperationBeforePeriod: smvk_history_data(distinct_on: timestamp, order_by: {timestamp: desc}, where: {timestamp: {_lte: $periodTimestamp}}, limit: 1) {
      mvk_total_supply
      smvk_total_supply
      timestamp
    }

    amountOfOperationsBeforePeriod: smvk_history_data_aggregate(where: {timestamp: {_lte: $periodTimestamp }}) {
      aggregate {
        count
      }
    }
  }
`)

export const DAPP_MVK_SMVK_STATS = gql(`
  query getDappSmvkMvkStats($doormanContractAddress: String) {
    mavryk_user(where: { address: { _eq: $doormanContractAddress } }) {
      address
      mvk_balance
      smvk_balance
    }

    mvk_token {
      total_supply
      maximum_supply
    }
  }
`)

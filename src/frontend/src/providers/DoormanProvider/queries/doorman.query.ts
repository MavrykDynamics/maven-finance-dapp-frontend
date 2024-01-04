import { gql } from 'utils/__generated__/gql'

export const SMVN_MVN_HISTORY_DATA = gql(`
  query smvnMvnHistoryData($periodTimestamp: timestamptz = "1970-01-01T00:00:00.000Z") {
    operationsInPeriod: smvn_history_data(distinct_on: timestamp, where: {timestamp: {_gte: $periodTimestamp}}) {
      mvn_total_supply
      smvn_total_supply
      timestamp
    }
  
  	lastOperationBeforePeriod: smvn_history_data(distinct_on: timestamp, order_by: {timestamp: desc}, where: {timestamp: {_lte: $periodTimestamp}}, limit: 1) {
      mvn_total_supply
      smvn_total_supply
      timestamp
    }

    amountOfOperationsBeforePeriod: smvn_history_data_aggregate(where: {timestamp: {_lte: $periodTimestamp }}) {
      aggregate {
        count
      }
    }
  }
`)

export const DAPP_MVN_SMVN_STATS = gql(`
  query getDappSmvnMvnStats($doormanContractAddress: String) {
    maven_user: maven_user(where: { address: { _eq: $doormanContractAddress } }) {
      address
      mvn_balance
      smvn_balance
    }

    mvn_token: mvn_token {
      total_supply
      maximum_supply
    }
  }
`)

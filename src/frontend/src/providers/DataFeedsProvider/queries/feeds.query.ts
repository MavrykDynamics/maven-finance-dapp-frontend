import { TypedDocumentNode, OperationVariables } from '@apollo/client'
import { DocumentNode } from 'graphql'
import { gql } from 'utils/__generated__'
import { gql as apolloGql } from '@apollo/client'

// TODO: add pagination by period
export const FEED_HISTORY_QUERY = gql(`
query feedHistoryQeury($feedAddress: String = "", $periodTimestamp: timestamptz = "1970-01-01T00:00:00.000Z") {
    aggregator(where: { address: { _eq: $feedAddress } }) {
      history_data(distinct_on: timestamp, order_by: { timestamp: desc }, where: {timestamp: {_gte: $periodTimestamp}}) {
        data
        timestamp
        aggregator {
          decimals
        }
      }
    }
  }
`)

export const testFeedsQuery = () => `
  query dataFeeds {
    ${
      process.env.REACT_APP_IS_DEMO === 'true' ? '' : 'dev_'
    }aggregator(where: { admin: { _neq: "" } }, order_by: { creation_timestamp: desc }) {
      address
      name
      admin
      decimals
      network
      metadata
      
      creation_timestamp
      last_completed_data
      last_completed_data_last_updated_at
      last_completed_data_pct_oracle_resp
      
      heart_beat_seconds
      reward_amount_xtz
      reward_amount_smvk
      pct_oracle_threshold
      alpha_pct_per_thousand

      # feed oracles amount
      oracles_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`

// initial query to load all feeds
export const FEEDS_QUERY = apolloGql(testFeedsQuery())

// gql(`
//   query dataFeeds {
//     aggregator(where: { admin: { _neq: "" } }, order_by: { creation_timestamp: desc }) {
//       address
//       name
//       admin
//       decimals
//       network
//       metadata

//       creation_timestamp
//       last_completed_data
//       last_completed_data_last_updated_at
//       last_completed_data_pct_oracle_resp

//       heart_beat_seconds
//       reward_amount_xtz
//       reward_amount_smvk
//       pct_oracle_threshold
//       alpha_pct_per_thousand

//       # feed oracles amount
//       oracles_aggregate {
//         aggregate {
//           count
//         }
//       }
//     }
//   }
// `)

export const FEEDS_DEV_QUERY = gql(`
  query dataFeeds_dev {
    aggregator : dev_aggregator(where: { admin: { _neq: "" } }, order_by: { creation_timestamp: desc }) {
      address
      name
      admin
      decimals
      network
      metadata
      
      creation_timestamp
      last_completed_data
      last_completed_data_last_updated_at
      last_completed_data_pct_oracle_resp

      update_data_paused
      

      # feed oracles amount
      oracles_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`)

// load data that updates, and track whether new feed was added
export const FEEDS_UPDATE_QUERY = gql(`
  query dataFeedsPrices {
    aggregator(where: { admin: { _neq: "" } }, order_by: { creation_timestamp: desc }) {
      address
      name
      decimals
      last_completed_data
      last_completed_data_pct_oracle_resp
      last_completed_data_last_updated_at
    }
  }
`)

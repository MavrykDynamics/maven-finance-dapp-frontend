import { gql } from 'utils/__generated__'

// TODO: refactor
// feeds rewards subsciption query with interval or refetch when feed change or heart_beat_seconds
export const SUBSCRIBE_FEED_HISTORY = gql(`
subscription subsribeFeedHistoryData($feedAddress: String) {
    aggregator(where: { address: { _eq: $feedAddress } }) {
      history_data(distinct_on: timestamp, order_by: { timestamp: desc }) {
        data
        timestamp
        aggregator {
          decimals
        }
      }
    }
  }
`)

// initial query to load all feeds
export const FEEDS_QUERY = gql(`
  query dataFeeds {
    aggregator(where: { admin: { _neq: "" } }, order_by: { creation_timestamp: desc }) {
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

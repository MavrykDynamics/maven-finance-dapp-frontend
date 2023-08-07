import { gql } from 'utils/__generated__/gql'

// feeds rewards subsciption just query
export const SUBSCRIBE_FEEDS_REWARDS_COUNT = gql(`
  subscription FeedsRewardsAmountSubscription {
    aggregator_aggregate {
      aggregate {
        sum {
          reward_amount_smvk
        }
      }
    }
  }
`)

// feeds rewards subsciption query with interval or refetch when feed change or heart_beat_seconds
export const SUBSCRIBE_FEED_HISTORY = gql(`
  queryWithPool subsribeFeedHistoryData($feedAddress: String) {
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

// feeds subsciption convert to query
export const SUBSCRIBE_FEEDS = gql(`
  subscription subsribeOracleDataFeed {
    aggregator(where: { admin: { _neq: "" } }, order_by: { creation_timestamp: desc }) {
      address
      admin
      decimals
      factory {
        address
      }
      metadata
      network
      creation_timestamp
      last_completed_data
      last_completed_data_last_updated_at
      last_completed_data_pct_oracle_resp
      last_updated_at
      heart_beat_seconds
      name
      reward_amount_xtz
      reward_amount_smvk
      pct_oracle_threshold
      alpha_pct_per_thousand
      heart_beat_seconds
      oracles_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`)

// make this sub, on update refetch history and if more items received run SUBSCRIBE_FEEDS to get data for newly added feed
// address
// last_completed_data
// last_completed_data_pct_oracle_resp
// last_completed_data_last_updated_at

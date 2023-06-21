import { gql } from 'utils/__generated__/gql'

// feeds rewards subsciption
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

// TODO: extract history data to separate hook and use only on details page
// feeds subsciption
export const SUBSCRIBE_FEEDS = gql(`
  subscription subsribeOracleDataFeed {
    aggregator(where: { admin: { _neq: "" } }, order_by: { creation_timestamp: desc }) {
      address
      admin
      decimals
      factory {
        address
      }
      history_data(distinct_on: timestamp, order_by: { timestamp: desc }) {
        data
        timestamp
        aggregator {
          decimals
        }
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

export const ORACLE_STORAGE_QUERY = `
  query GetOracleDataFeeds {
    aggregator(where: {admin: {_neq: ""}}, order_by: {creation_timestamp: desc}) {
      address
      admin
      decimals
      metadata
      network
      factory {
        address
      }
      history_data(distinct_on: timestamp, order_by: {timestamp: desc}) {
        data
        timestamp
        aggregator {
          decimals
        }
      }
      creation_timestamp
      governance_id
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
      oracles {
        observations {
          epoch
          round
          timestamp
          oracle {
            user {
              address
            }
            init_epoch
            init_round
          }
        }
      }
    }
    aggregator_factory {
      address
      admin
      create_aggregator_paused
      distribute_reward_smvk_paused
      distribute_reward_xtz_paused
      governance_id
      track_aggregator_paused
      untrack_aggregator_paused
      aggregator_name_max_length
    }
  }
`

export const ORACLE_STORAGE_QUERY_NAME = 'GetOracleDataFeeds'
export const ORACLE_STORAGE_QUERY_VARIABLE = {}

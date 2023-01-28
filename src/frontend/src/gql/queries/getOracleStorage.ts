export const ORACLE_STORAGE_QUERY = `
   query GetOracleDataFeeds {
    aggregator(where: {admin: {_neq: ""}}, order_by: {creation_timestamp: desc}) {
      address
      admin
      decimals
      factory {
        address
      }
      history_data(distinct_on: timestamp) {
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
      name
      reward_amount_xtz
      reward_amount_smvk
      pct_oracle_threshold
      oracles {
        observations {
          epoch
          round
          timestamp
          oracle {
            user_id
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
    dipdup_contract_metadata {
      contract
      created_at
      id
      metadata
      update_id
      updated_at
      network
    }
  }
`

export const ORACLE_STORAGE_QUERY_NAME = 'GetOracleDataFeeds'
export const ORACLE_STORAGE_QUERY_VARIABLE = {}

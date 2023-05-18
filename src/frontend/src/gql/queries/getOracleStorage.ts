import { gql } from 'utils/__generated__'

export const ORACLE_STORAGE_QUERY = `
   query GetOracleDataFeeds {
    aggregator(where: {admin: {_neq: ""}}, order_by: {creation_timestamp: desc}) {
      address
      admin
      decimals
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
            user_id
            init_epoch
            init_round
          }
        }
      }
    }
    aggregator_factory {
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

// data feeds context
export const GET_ORACLE_STORAGE_QUERY = gql(`
query GetOracleDataFeeds {
  aggregator(where: {admin: {_neq: ""}}, order_by: {creation_timestamp: desc}) {
    address
    admin
    decimals
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
          user_id
          init_epoch
          init_round
        }
      }
    }
  }
  aggregator_factory {
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
`)

// subscriptions
export const SUBSCRIBE_CHAIN_POINTS_COUNT = gql(`
subscription SatellitesStorageSubscription {
  aggregator_aggregate {
    aggregate {
      count
    }
  }
}
`)

export const SUBSCRIBTION_ORACLE_STORAGE_AGGREGATOR = gql(`
  subscription subscribeOracleStorageAggregator {
    aggregator(where: {admin: {_neq: ""}}, order_by: {creation_timestamp: desc}) {
      address
      admin
      decimals
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
            user_id
            init_epoch
            init_round
          }
        }
      }
    }
  }
`)

export const SUBSCRIBTION_ORACLE_STORAGE_AGGREGATOR_FACTORY = gql(`
  subscription subscribeOracleStorageAggregatorFactory {
    aggregator_factory {
      aggregator_name_max_length
    }
  }
`)
export const SUBSCRIBTION_ORACLE_STORAGE_DIPDUP_CONTRACT_METADATA = gql(`
  subscription subscribeOracleStorageDipdupContractMetadata {
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
`)

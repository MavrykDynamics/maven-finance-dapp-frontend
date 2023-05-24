import { OperationVariables, TypedDocumentNode, gql as apolloGql } from '@apollo/client'
import { DocumentNode } from 'graphql'
import { gql } from 'utils/__generated__/gql'
import { SubscribeOracleStorageAggregatorSubscription } from 'utils/__generated__/graphql'

// Dip dup metadate for feeds TODO: remove later
export const DIP_DUP_CONTRACTS_QUERY = gql(`
   query dipDupContracts {
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

// feeds amount sub
export const SUBSCRIBE_CHAIN_POINTS_COUNT = gql(`
  subscription FeedsAmountSubscription {
    aggregator_aggregate {
      aggregate {
        count
      }
    }
  }
`)

// feeds amount sub
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

// feeds subsciption
export const getOrcaleStorageAggregatorQuery = (
  address?: string,
): DocumentNode | TypedDocumentNode<SubscribeOracleStorageAggregatorSubscription, OperationVariables> =>
  apolloGql(`
  subscription subsribeOracleDataFeed($address:String = "") {
    aggregator(where: {admin: {_neq: ""}, ${
      address ? 'address: {_eq: $address}' : ''
    }}, order_by: {creation_timestamp: desc}) {
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
`) as DocumentNode | TypedDocumentNode<SubscribeOracleStorageAggregatorSubscription, OperationVariables>

// query to generate type for query
export const _FEEDS_QUERY_FOR_TYPE = gql(`
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

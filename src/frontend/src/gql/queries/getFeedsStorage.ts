import { OperationVariables, TypedDocumentNode, gql as apolloGql } from '@apollo/client'
import { DocumentNode } from 'graphql'
import { gql } from 'utils/__generated__/gql'
import { SubsribeOracleDataFeedSubscription } from 'utils/__generated__/graphql'

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

// feeds addresses subsciption
export const SUBSCRIBE_FEEDS_ADDRESSES = gql(`
  subscription FeedsAddressesSubscription {
    aggregator {
      address
    }
  }
`)

// feeds subsciption
export const getOrcaleStorageAggregatorQuery = (
  address?: string,
): DocumentNode | TypedDocumentNode<SubsribeOracleDataFeedSubscription, OperationVariables> => {
  const filterCond = address ? `address: {_eq: ${address}}` : 'address: {_neq: ""}'

  return apolloGql(`
  subscription subsribeOracleDataFeed {
    aggregator(where: {admin: {_neq: ""}, ${filterCond}}, order_by: {creation_timestamp: desc}) {
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
`) as DocumentNode | TypedDocumentNode<SubsribeOracleDataFeedSubscription, OperationVariables>
}

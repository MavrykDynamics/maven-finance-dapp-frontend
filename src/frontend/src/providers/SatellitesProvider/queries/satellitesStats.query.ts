import { gql } from 'utils/__generated__'

import { gql as originalGql } from '@apollo/client'

// data for sidebar
export const SATELLITES_STATS = gql(`
query SatellitesStatsQuery{
  # oracles amount
  oraclesAmount: satellite_aggregate(where: {user: {aggregator_oracles_aggregate: {count: {predicate: {_gt: 0}}}}}) {
    aggregate {
      count
    }
  }

  # active satellites amount
  activeSatellitesAmount: satellite_aggregate(where: {user: {satellites: {status: {_eq: "0"}, currently_registered: {_eq: true}}}}) {
    aggregate {
      count
    }
  }

  # oracles rewards 
  oraclesRewards: aggregator_oracle_reward_aggregate(where: {type: {_eq: "1"}, oracle: {user: {satellites: {registration_timestamp: {_is_null: false}}}}}) {
    aggregate {
      sum {
        reward
      }
      count
    }
  }

  # total delegated to satellites
  satellite_aggregate: satellite_aggregate(where: {currently_registered: {_eq: true}, status: {_eq: "0"}}) {
    nodes {
      user {
        smvn_balance,
      }
      delegations {
        user {
          smvn_balance
        }
      }
    }
  }
}
`)

export const SATELLITES_DASHBOARD_STATS = originalGql(`
query SatellitesDashboardStatsQuery {
  gql_satellite_summary {
    avg_delegated_smvn
    avg_delegation_fee
    avg_free_smvn_balance
    avg_mvn_staked
    avg_participation_rate
  }
}

`)

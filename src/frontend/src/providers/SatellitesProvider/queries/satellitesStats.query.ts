import { gql } from 'utils/__generated__'

// statistic subs
export const SATELLITE_STATS = gql(`
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
  aggregator_oracle_reward_aggregate(where: {type: {_eq: "1"}, oracle: {user: {satellites: {registration_timestamp: {_is_null: false}}}}}) {
    aggregate {
      sum {
        reward
      }
    }
  }

  # total delegated to satellites
  satellite_aggregate(where: {currently_registered: {_eq: true}, status: {_eq: "0"}}) {
    nodes {
      user {
        smvk_balance,
      }
      delegations {
        user {
          smvk_balance
        }
      }
    }
  }
}
`)

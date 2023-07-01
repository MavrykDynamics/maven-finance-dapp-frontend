import { gql } from 'utils/__generated__'

// statistic subs
export const ORACLES_COUNT_STAT = gql(`
subscription OraclesCountStat {
  satellite_aggregate(where: {user: {aggregator_oracles_aggregate: {count: {predicate: {_gt: 0}}}}}) {
    aggregate {
      count
    }
  }
}
`)

export const ACTIVE_SATELLITES_COUNT_STAT = gql(`
subscription ActiveSatellitesCount {
  satellite_aggregate(where: {user: {satellites: {status: {_eq: "0"}, currently_registered: {_eq: true}}}}) {
    aggregate {
      count
    }
  }
}
`)

export const ORACLES_TOTAL_REWARD = gql(`
subscription satelliteOraclesReward {
  aggregator_oracle_reward_aggregate(where: {type: {_eq: "1"}, oracle: {user: {satellites: {registration_timestamp: {_is_null: false}}}}}) {
    aggregate {
      sum {
        reward
      }
    }
  }
}
`)

export const SATELLITES_TOTAL_SMVK_NUMBERS = gql(`
subscription SatelliteStatTotal {
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

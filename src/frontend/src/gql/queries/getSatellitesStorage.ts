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

export const ALL_SATELLITES_COUNT_STAT = gql(`
subscription allSatellitesCount {
  satellite_aggregate {
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

// subs

export const SATELLITE_GOVERNANCE_PROPOSAL_DATA_SUBSCRIPTION = gql(`
subscription satelliteGovernanceProposalData {
governance_proposal(order_by: {start_datetime: desc}) {
  id
  executed
  locked  
}
}
`)

export const SATELLITE_EMERGENCY_GOVERNANCE_DATA_SUBSCRIPTION = gql(`
subscription satelliteEmergencyGovernanceData {
  emergency_governance {
    emergency_governance_records(order_by: {start_timestamp: desc}) {
      emergency_governance_id
      executed
    }
  }
}
`)

export const SATELLITE_GOVERNANCE_FINANCIAL_REQUEST_SUBSCRIPTION = gql(`
subscription satelliteGovernanceFinancialRequest {
  governance_financial_request {
    executed
    id
  }
}
`)

export const SATELLITE_AGGREGATOR_ORACLES_SUBSCRIPTION = gql(`
subscription satelliteAggregatorOracles {
  aggregator(where: {admin: {_neq: ""}}, order_by: {creation_timestamp: desc}) {
    admin
    last_completed_data_last_updated_at
    heart_beat_seconds
    oracles {
      observations(order_by: {timestamp: desc}, limit: 1) {
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
      observations_aggregate {
        aggregate {
          count(columns: timestamp)
        }
      }
    }
  }
}
`)

export const SATELLITE_CYCLE_SUBSCRIPTION = gql(`
subscription satelliteGovernanceCycle {
  governance {
    satellite_snapshots(order_by: {cycle: desc_nulls_last}) {
      cycle
      user_id
      total_voting_power
    }
    cycle_id
  }
}
`)

import { OperationVariables, TypedDocumentNode } from '@apollo/client'
import { DocumentNode } from 'graphql'
import { gql } from 'utils/__generated__'
import { gql as apolloGql } from '@apollo/client'
import { SatelliteDataSubscription } from 'utils/__generated__/graphql'

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

// queries
export const SATELLITES_STORAGE_QUERY = gql(`
  query SatellitesStorage {
    satellite(order_by: {currently_registered: desc}) {
      description
      fee
      image
      name
      status
      website
      user_id
      currently_registered
      peer_id
      public_key

      delegations {
        user {
          smvk_balance
        }
      }

      delegation {
        delegation_ratio
      }

      user {
        smvk_balance
        mvk_balance
        aggregator_oracles {
          aggregator_id
          user_id
          observations(order_by: {epoch: desc_nulls_last}, limit: 5) {
            oracle_id
            epoch
            data
            round
            timestamp
          }
          aggregator {
            address
            last_completed_data
            last_completed_data_epoch
            last_completed_data_round
            oracles {
              user_id
              rewards {
                reward
                type
              }
            }
          }
        }

        emergency_governance_votes {
          emergency_governance_record_id
          id
          smvk_amount
          timestamp
          voter_id
          emergency_governance_record {
            title
          }
        }

        governance_financial_requests_votes {
          governance_financial_request_id
          id
          timestamp
          vote
          voter_id
          governance_financial_request {
            request_type
          }
        }

        governance_proposals_votes (order_by: {timestamp: desc}) {
          governance_proposal_id
          id
          round
          timestamp
          vote
          voter_id
          voting_power
          current_round_vote
          governance_proposal {
            title
            executed
            locked
          }
        }

        governance_satellite_actions_votes {
          governance_satellite_action_id
          id
          timestamp
          vote
          voter_id
          governance_satellite_action {
            governance_type
          }
        }
        
      }
    }

    governance_proposal(order_by: {start_datetime: desc}) {
      id
      executed
      locked
    }

    emergency_governance {
      emergency_governance_records(order_by: {start_timestamp: desc}) {
        emergency_governance_id
        executed
      }
    }

    governance_financial_request {
      executed
      id
    }

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
            user_id
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
          user_id
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

// this one used for type creation only
export const SATELLITE_DATA_SUBSCRIPTION = gql(`
subscription satelliteData {
satellite(order_by: {currently_registered: desc}) {
  description
  fee
  image
  name
  status
  website
  user_id
  currently_registered
  peer_id
  public_key

  delegations {
    user {
      smvk_balance
    }
  }

  delegation {
    delegation_ratio
  }

  user {
    smvk_balance
    mvk_balance
    aggregator_oracles {
      aggregator_id
      user_id
      observations(order_by: {epoch: desc_nulls_last}, limit: 5) {
        oracle_id
        epoch
        data
        round
        timestamp
      }
      aggregator {
        address
        last_completed_data
        last_completed_data_epoch
        last_completed_data_round
        oracles {
          user_id
          rewards {
            reward
            type
          }
        }
      }
    }

    emergency_governance_votes {
      emergency_governance_record_id
      id
      smvk_amount
      timestamp
      voter_id
      emergency_governance_record {
        title
      }
    }

    governance_financial_requests_votes {
      governance_financial_request_id
      id
      timestamp
      vote
      voter_id
      governance_financial_request {
        request_type
      }
    }

    governance_proposals_votes (order_by: {timestamp: desc}) {
      governance_proposal_id
      id
      round
      timestamp
      vote
      voter_id
      voting_power
      current_round_vote
      governance_proposal {
        title
        executed
        locked
      }
    }

    governance_satellite_actions_votes {
      governance_satellite_action_id
      id
      timestamp
      vote
      voter_id
      governance_satellite_action {
        governance_type
      }
    }
    
  }
}
}
`)

export function getSatelliteDataSubscription(
  user_id?: string,
): DocumentNode | TypedDocumentNode<SatelliteDataSubscription, OperationVariables> {
  const filteredCondition = user_id ? `user_id: {_eq: "${user_id}"}` : `user_id: {_neq: ""}`

  return apolloGql`
  subscription satelliteDataSub {
    satellite(where: {registration_timestamp: {_is_null: false}, ${filteredCondition}}, order_by: {currently_registered: desc}) {
      description
      fee
      image
      name
      status
      website
      user_id
      currently_registered
      peer_id
      public_key
      delegations {
        user {
          smvk_balance
        }
      }
      delegation {
        delegation_ratio
      }
      user {
        smvk_balance
        mvk_balance
        aggregator_oracles {
          aggregator_id
          user_id
          observations(order_by: {epoch: desc_nulls_last}, limit: 5) {
            oracle_id
            epoch
            data
            round
            timestamp
          }
          aggregator {
            address
            last_completed_data
            last_completed_data_epoch
            last_completed_data_round
            oracles {
              user_id
              rewards {
                reward
                type
              }
            }
          }
        }
        emergency_governance_votes {
          emergency_governance_record_id
          id
          smvk_amount
          timestamp
          voter_id
          emergency_governance_record {
            title
          }
        }
        governance_financial_requests_votes {
          governance_financial_request_id
          id
          timestamp
          vote
          voter_id
          governance_financial_request {
            request_type
          }
        }
        governance_proposals_votes(order_by: {timestamp: desc}) {
          governance_proposal_id
          id
          round
          timestamp
          vote
          voter_id
          voting_power
          current_round_vote
          governance_proposal {
            title
            executed
            locked
          }
        }
        governance_satellite_actions_votes {
          governance_satellite_action_id
          id
          timestamp
          vote
          voter_id
          governance_satellite_action {
            governance_type
          }
        }
      }
    }
  }
  ` as DocumentNode | TypedDocumentNode<SatelliteDataSubscription, OperationVariables>
}

export const SATELLITES_STORAGE_QUERY = `

query SatellitesStorageQuery {
  satellite(order_by: {currently_registered: desc}) {
    description
    fee
    image
    name
    status
    website
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
      address
      smvk_balance
      mvk_balance
      aggregator_oracles {
        observations(order_by: {epoch: desc_nulls_last}, limit: 5) {
          oracle {
            user {
              address
            }
          }
          epoch
          data
          round
          timestamp
        }
        user {
          address
        }
        aggregator {
          address
          last_completed_data
          last_completed_data_epoch
          last_completed_data_round
          oracles {
            user {
              address
            }
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
  governance {
    satellite_snapshots(order_by: {cycle: desc_nulls_last}) {
      user {
        address
      }
      cycle
      total_voting_power
    }
    cycle_id
  }
  governance_financial_request {
    executed
    id
  }
  aggregator(where: {admin: {_neq: ""}}, order_by: {creation_timestamp: desc}) {
    address
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
}
`

export const SATELLITES_STORAGE_QUERY_NAME = 'SatellitesStorageQuery'
export const SATELLITES_STORAGE_QUERY_VARIABLE = {}

export const SATELLITE_CONFIG_QUERY = `
  query SatelliteConfigQuery {
    delegation {
      minimum_smvk_balance
    }
  }
`

export const SATELLITE_CONFIG_QUERY_NAME = 'SatelliteConfigQuery'
export const SATELLITE_CONFIG_QUERY_VARIABLE = {}

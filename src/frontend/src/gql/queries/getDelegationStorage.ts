export const SATELLITES_STORAGE_QUERY = (satelliteAddress?: string) => `
  query SatellitesStorageQuery${satelliteAddress ? `($_eq: String = "${satelliteAddress}")` : ''} {
    satellite${satelliteAddress ? `(where: {user_id: {_eq: $_eq}})` : ''} {
      currently_registered
      delegation_id
      description
      fee
      id
      image
      name
      status
      website
      user_id
      currently_registered
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
`

export const SATELLITES_STORAGE_QUERY_NAME = 'SatellitesStorageQuery'
export const SATELLITES_STORAGE_QUERY_VARIABLE = {}

export const SATELLITE_CONFIG_QUERY = `
  query SatelliteConfigQuery {
    delegation {
      minimum_smvk_balance
      satellite_description_max_length
      satellite_name_max_length
      satellite_website_max_length
    }
  }
`

export const SATELLITE_CONFIG_QUERY_NAME = 'SatelliteConfigQuery'
export const SATELLITE_CONFIG_QUERY_VARIABLE = {}

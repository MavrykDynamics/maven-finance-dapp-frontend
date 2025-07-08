import { gql } from 'utils/__generated__'

export const CHECK_WHETHER_SATELLITE_EXISTS = gql(`
  query checkWitherSatelliteExists($userAddress: String = "") {
    satellite: satellite(where: {registration_timestamp: {_is_null: false}, user: {address: {_eq: $userAddress}}}) {
      user {
        address
      }
    }
  }
`)

export const SATELLITE_DATA_QUERY = gql(`
  query satelliteDataQuery($limit: Int = 10, $offset: Int = 0, $satelliteWhere: satellite_data_view_bool_exp, $satelliteOrderBy: [satellite_data_view_order_by!]) {
  satellite: satellite_data_view(limit: $limit, offset: $offset, where: $satelliteWhere, order_by: $satelliteOrderBy) {
    description
    fee
    image
    name
    status
    website
    currently_registered
    peer_id
    public_key
    satellite_action_counter
    governance_proposal_counter
    financial_request_counter
    delegator_count
    user_address
    smvn_balance
    mvn_balance
    total_observations_count
    smvn_rewards_total
    mvrk_rewards_total
    total_voting_power
    governance_proposal_counter
    created_fin_requests_count
    gov_proposals_votes_count
    fin_requests_votes_count
    financial_requests_voted_on
    free_smvn_balance
    created_gov_proposals_count
    created_satellite_gov_actions_count
    last_vote
    last_proposal_current_round
    last_proposal_cycle
    last_proposal_governance_cycle_id
    last_proposal_id
    last_proposal_title
    last_updated
    satellite_id
    satellite_gov_actions_votes_count
    satellite_actions_voted_on
    participation_rate
    proposals_voted_on
    registration_timestamp
    total_delegated_amount
    participated_feeds
    last_observation_timestamp
    last_observation_round
    last_observation_data
    last_observation_epoch
    last_observation_aggregator_address
  }
}

`)

export const SATELLITE_AGGREGATE_COUNT = gql(`
   query GetSatellitesCount($whereBySatelliteTotal: satellite_bool_exp, $whereBysatelliteAddress: satellite_bool_exp, $whereByActiveSatellite: satellite_bool_exp, $whereOracles: satellite_bool_exp) {
  totalSatellites: satellite_aggregate(where: $whereBySatelliteTotal) {
    aggregate {
      count
    }
  }
  userSatellites: satellite_aggregate(where: $whereBysatelliteAddress) {
    aggregate {
      count
    }
  }
  activeSatellites: satellite_aggregate(where: $whereByActiveSatellite) {
    aggregate {
      count
    }
  }
  oracleSatellites: satellite_aggregate(where: $whereOracles) {
    aggregate {
      count
    }
  }
}
  `)

export const SATELLITE_ADDITIONAL_DATA = gql(`
  query satelliteAdditionalDataQuery($satelliteAdditionalWhere: satellite_bool_exp) {
  satelliteAdditionalData: satellite(where: $satelliteAdditionalWhere) {
    delegation {
      delegation_ratio
    }
    user {
      address
      aggregator_oracles {
        aggregator {
          address
        }
        init_epoch
        init_round
        observations(order_by: {timestamp: desc}, limit: 1) {
          epoch
          round
          timestamp
          data
        }
        smvnRewardsAmount: rewards_aggregate(where: {type: {_eq: "1"}}) {
          aggregate {
            sum {
              reward
            }
          }
        }
        xtzRewardsAmount: rewards_aggregate(where: {type: {_eq: "0"}}) {
          aggregate {
            sum {
              reward
            }
          }
        }
      }
    }
  }
}
  `)

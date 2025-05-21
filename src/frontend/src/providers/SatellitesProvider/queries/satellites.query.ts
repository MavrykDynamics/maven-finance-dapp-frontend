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
  query satelliteDataQuery($satelliteWhere: satellite_bool_exp, $satelliteOrderBy: [satellite_order_by!], $limit: Int = 10, $offset: Int = 0) {
    satelliteAddresses: satellite_aggregate(order_by: $satelliteOrderBy, limit: $limit, offset: $offset) {
			nodes {
				user {
					address
				}
			}
		}

    satellite: satellite(where: $satelliteWhere, order_by: $satelliteOrderBy, limit: $limit, offset: $offset) {
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
      total_delegated_amount

      delegatorCount: delegations_aggregate {
        aggregate {
          count
        }
      }

      delegation {
        delegation_ratio
      }

      user {
				address
        smvn_balance
        mvn_balance

        # get latest observation for every feed, then need to get latest of all feeds
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

          # feeds smvn rewards amount
          smvnRewardsAmount: rewards_aggregate(where: {type: {_eq: "1"}}) {
            aggregate {
              sum {
                reward
              }
            }
          }
          
          # feeds xtz rewards amount
          xtzRewardsAmount: rewards_aggregate(where: {type: {_eq: "0"}}) {
            aggregate {
              sum {
                reward
              }
            }
          }
        }

        # amount of all observations
        feedsObservationsAmount: aggregator_oracles_aggregate {
          nodes {
            observations_aggregate {
              aggregate {
                count
              }
            }
          }
        }

        # satellite total voting power
        governance_satellite_snapshots(where: {latest: {_eq: true}}) {
          total_voting_power
        }

        # last voted proposal
        lastVotedProposal: governance_proposals_votes(order_by: {timestamp: desc}, limit: 1) {
          vote
          governance_proposal {
            id
            title
            
            cycle
            current_round_proposal
            governance {
              cycle_id
            }
          }
        }

        # --------  SATELLITE METRICS PART --------

        # amount of governance proposals created by satellite
        createdGovProposalsAmount: governance_proposals_proposer_aggregate {
          aggregate {
            count
          }
        }
        
        # amount of financial requests created by satellite
        createdFinRequestsAmount: governance_financial_requests_requester_aggregate {
          aggregate {
            count
          }
        }
        
        # amount of satellite governance actions created by satellite
        createdSatelliteGovActionsAmount: governance_satellite_action_initiators_aggregate {
          aggregate {
            count
          }
        }

        # amount of governance proposals votes made by satellite
        govProposalsVotesAmount: governance_proposals_votes_aggregate {
          aggregate {
            count
          }
        }
        
        # amount of financial requests votes made by satellite
        finRequestsVotesAmount: governance_financial_requests_votes_aggregate {
          aggregate {
            count
          }
        }
        
        # amount of satellite governance actions votes made by satellite
        satelliteGovActionsVotesAmount: governance_satellite_actions_votes_aggregate {
          aggregate {
            count
          }
        }
      }
    }
  }
`)

export const SATELLITE_AGGREGATE_COUNT = gql(`
   query GetSatellitesCount($whereBysatelliteAddress: satellite_bool_exp, $whereByActiveSatellite: satellite_bool_exp, $whereOracles: satellite_bool_exp) {
  totalSatellites: satellite_aggregate {
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

import { OperationVariables, TypedDocumentNode } from '@apollo/client'
import { DocumentNode } from 'graphql'
import { gql as apolloGql } from '@apollo/client'
import { SatelliteDataSubSubscription } from 'utils/__generated__/graphql'
import { ALL_SATELLITES_SUB } from '../satellites.const'

export function getSatelliteDataSubscription(
  userAddress: string | null,
): DocumentNode | TypedDocumentNode<SatelliteDataSubSubscription, OperationVariables> {
  const filteredCondition = `user: {address: {${userAddress !== ALL_SATELLITES_SUB ? '_eq' : '_neq'}: $userAddress}}`

  return apolloGql`subscription satelliteDataSub($userAddress: String!) {
    satellite(where: {registration_timestamp: {_is_null: false}, ${filteredCondition}}, order_by: {currently_registered: desc}) {
      description
      fee
      image
      name
      status
      website
      currently_registered
      peer_id
      public_key

      delegatorCount: delegations_aggregate {
        aggregate {
          count
        }
      }

      total_delegated_amount

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
          }

          # satellite feed predictions aggregated
          observations_aggregate {
            aggregate {
              sum {
                data
              }
              count
            }
          }

          # feeds smvk rewards amount
          smvkRewardsAmount: rewards_aggregate(where: {type: {_eq: "1"}}) {
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

        # amount of governance proposals created by satellite
        createdGovProposalsAmount: governance_proposals_proposer_aggregate {
          aggregate {
            count
          }
        }
        
        # amount of financial requests created by satellite
        createdFinProposalsAmount: governance_financial_requests_requester_aggregate {
          aggregate {
            count
          }
        }
        
        # amount of satellite governance actions created by satellite
        createdSatelliteGovProposalsAmount: governance_satellite_action_initiators_aggregate {
          aggregate {
            count
          }
        }

        # satellite total voting power
        governance_satellite_snapshots(order_by: {cycle: desc}, limit: 1) {
          cycle
          total_voting_power
          governance {
            cycle_id
          }
        }

        # Egov votes
        emergency_governance_votes {
          emergency_governance_record_id
          id
          smvk_amount
          timestamp
          emergency_governance_record {
            title
          }
        }

        # Financial Request votes
        governance_financial_requests_votes {
          timestamp
          vote
          id
          governance_financial_request {
            request_type
          }
        }

        # Proposals votes
        governance_proposals_votes(order_by: {timestamp: desc}, where: {round: {_eq: "1"}}) {
          timestamp
          vote
          id
          governance_proposal {
            id
            title
            executed
          }
        }

        # Satellite governance votes
        governance_satellite_actions_votes {
          timestamp
          vote
          id
          governance_satellite_action {
            governance_type
          }
        }
      }
    }
  }
  
  ` as DocumentNode | TypedDocumentNode<SatelliteDataSubSubscription, OperationVariables>
}

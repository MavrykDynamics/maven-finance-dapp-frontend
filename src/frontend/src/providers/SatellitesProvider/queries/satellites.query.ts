import { OperationVariables, TypedDocumentNode } from '@apollo/client'
import { DocumentNode } from 'graphql'
import { gql as apolloGql } from '@apollo/client'
import { SatelliteDataSubSubscription } from 'utils/__generated__/graphql'

export function getSatelliteDataSubscription(
  user_id?: string,
): DocumentNode | TypedDocumentNode<SatelliteDataSubSubscription, OperationVariables> {
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

				# Egov votes
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

				# Financial Request votes
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

				# Proposals votes
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

				# Satellite governance votes
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
  ` as DocumentNode | TypedDocumentNode<SatelliteDataSubSubscription, OperationVariables>
}

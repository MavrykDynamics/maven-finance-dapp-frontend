import { OperationVariables, TypedDocumentNode } from '@apollo/client'
import { DocumentNode } from 'graphql'
import { gql as apolloGql } from '@apollo/client'
import { SatelliteDataSubSubscription } from 'utils/__generated__/graphql'
import { gql } from 'utils/__generated__'

export function getSatelliteDataSubscription(
  userAddress: string | null,
  isOnlyActive?: boolean,
  isOnlyOracles?: boolean,
): DocumentNode | TypedDocumentNode<SatelliteDataSubSubscription, OperationVariables> {
  const filteredByUserTable = `user: {address: {${userAddress ? '_eq' : '_neq'}: $userAddress} ${
    isOnlyOracles
      ? ', _and: {aggregator_oracles_aggregate: {count: {predicate: {_gte: 1}, filter: {observations_aggregate: {count: {predicate: {_gte: 1}}}}}}}'
      : ''
  }}`

  const activeSatellitesFilter = isOnlyActive ? `currently_registered: {_eq: true}, status: {_eq: "0"}` : null

  const filters = [filteredByUserTable, activeSatellitesFilter].filter(Boolean).join(',')

  return apolloGql`subscription satelliteDataSub($userAddress: String!) {
    satellite(where: {registration_timestamp: {_is_null: false}, ${filters}}, order_by: {currently_registered: desc}) {
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
            data
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

        # satellite total voting power
        governance_satellite_snapshots(order_by: {cycle: desc}, limit: 1) {
          cycle
          total_voting_power
          governance {
            cycle_id
          }
        }

        # last voted proposal
        lastVotedProposal: governance_proposals_votes(order_by: {timestamp: desc}, where: {round: {_eq: "1"}}) {
          vote
          governance_proposal {
            id
            title
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
  ` as DocumentNode | TypedDocumentNode<SatelliteDataSubSubscription, OperationVariables>
}

export const CHECK_WHETHER_SATELLITE_EXISTS = gql(`
query checkWitherSatelliteExists($userAddress: String = "") {
  satellite(where: {registration_timestamp: {_is_null: false}, user: {address: {_eq: $userAddress}}}) {
    user {
      address
    }
  }
}
`)

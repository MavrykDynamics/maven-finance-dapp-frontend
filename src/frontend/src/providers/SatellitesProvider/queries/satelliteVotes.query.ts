import { gql } from 'utils/__generated__'

export const SATELLITE_VOTES_SUBSCRIPTION = gql(`
	subscription satelliteVotesSub($userAddress: String!) {
		satellite(where: {registration_timestamp: {_is_null: false}, user: {address: {_eq: $userAddress}}}, order_by: {currently_registered: desc}) {
			user {
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
						title
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
`)

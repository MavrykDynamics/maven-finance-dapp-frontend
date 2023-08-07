import { gql } from 'utils/__generated__'

// make query ask sam about updates
export const PROPOSALS_AMOUNT_SUBSCRIPTION = gql(`
	subscription proposalsAmount {
		governance_proposal_aggregate {
			aggregate {
				count
			}
		}
	}
`)

export const SATELLITE_GOV_ACTIONS_AMOUNT_SUBSCRIPTION = gql(`
	subscription satelliteGovActionsAmount {
		governance_satellite_action_aggregate {
			aggregate {
				count
			}
		}
	}
`)

export const FINANCIAL_REQUESTS_AMOUNT_SUBSCRIPTION = gql(`
	subscription finRequestsAmount {
		governance_financial_request_aggregate {
			aggregate {
				count
			}
		}
	}
`)

// try to add to satellite data query
export const SATELLITES_ADDRESSES_SUBSCRIPTION = gql(`
	subscription satellitesAddresses {
		satellite_aggregate(order_by: {currently_registered: desc}) {
			nodes {
				user {
					address
				}
			}
		}
	}
`)

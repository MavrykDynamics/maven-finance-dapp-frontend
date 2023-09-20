import { gql } from 'utils/__generated__'

// satellite metrics helper data
export const SATELLITES_METRICS_DATA = gql(`
	query dappDataForSatelliteMetrics{
		# proposals amount
		governance_proposal_aggregate: governance_proposal_aggregate {
			aggregate {
				count
			}
		}

		# satellite governance actions
		governance_satellite_action_aggregate: governance_satellite_action_aggregate {
			aggregate {
				count
			}
		}

		# financial requests amount
		governance_financial_request_aggregate: governance_financial_request_aggregate {
			aggregate {
				count
			}
		}
	}
`)

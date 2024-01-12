import { gql } from 'utils/__generated__'

export const EGOV_ALL_PROPOSALS = gql(`
	query GetEGovAllProposalsQuery {
		emergency_governance_record: emergency_governance_record(order_by: {start_timestamp: desc}) {
			id
			title
			description
			
			executed
			start_timestamp
			execution_datetime
			expiration_timestamp
			
			smvn_percentage_required
			smvn_required_for_trigger
			total_smvn_votes

			proposer {
				address
			}
			
			voters {
				voter {
					address
				}
				smvn_amount
				timestamp
			}
		}
	}
`)

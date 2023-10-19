import { gql } from 'utils/__generated__'

export const EGOV_ALL_PROPOSALS = gql(`
	query GetEGovAllProposalsQuery {
		emergency_governance_record: emergency_governance_record {
			id
			title
			description
			
			executed
			start_timestamp
			execution_datetime
			expiration_timestamp
			
			smvk_percentage_required
			smvk_required_for_trigger
			total_smvk_votes

			proposer {
				address
			}
			
			voters {
				voter {
					address
				}
				smvk_amount
				timestamp
			}
		}
	}
`)

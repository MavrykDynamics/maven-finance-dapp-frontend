import { gql } from 'utils/__generated__'

export const EGOV_CONFIG_QUERY = gql(`
	query GetEGovConfigQuery {
		emergency_governance: emergency_governance {
			current_emergency_record_id
			smvn_percentage_required
			required_fee_mumav
			min_smvn_required_to_vote
		}
	}
`)

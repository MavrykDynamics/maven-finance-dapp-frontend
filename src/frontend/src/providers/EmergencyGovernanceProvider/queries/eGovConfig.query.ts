import { gql } from 'utils/__generated__'

export const EGOV_CONFIG_QUERY = gql(`
	query GetEGovConfigQuery {
		emergency_governance: emergency_governance {
			current_emergency_record_id
			smvk_percentage_required
			required_fee_mutez
			min_smvk_required_to_vote
		}
	}
`)

import { gql } from 'utils/__generated__'

export const GOVERNANCE_CONFIG_QUERY = gql(`
	query governanceConfigQuery {
		governance {
			address
			current_round
			success_reward
			cycle_id

			proposal_submission_fee_mutez
			timelock_proposal_id
			cycle_highest_voted_proposal_id
			current_round_end_level
		}
	}
`)

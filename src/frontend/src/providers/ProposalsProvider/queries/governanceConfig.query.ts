import { gql } from 'utils/__generated__'

export const GOVERNANCE_CONFIG_QUERY = gql(`
	query governanceConfigQuery {
		governance: governance {
			address
			current_round
			success_reward
			cycle_id

			proposal_submission_fee_mutez
			timelock_proposal_id
			cycle_highest_voted_proposal_id
			current_round_end_level

			# get proposals that might be execution, need to filter also by timelock_proposal_id field
			proposals(where: {executed: {_eq: false}, status: {_eq: "0"}, locked: {_eq: true}, defeated_datetime: {_is_null: true}, dropped_datetime: {_is_null: true}}) {
				id
			}
		}
	}
`)

import { gql } from 'utils/__generated__'

export const PAST_PROPOSALS_QUERY = gql(`
	query pastProposalsDataQuery {
		governance_proposal(order_by: {start_datetime: desc}, where: {_or: [{executed: {_eq: false}}, {current_round_proposal: {_eq: false}}, {status: {_eq: 1}}]}) {
			current_cycle_end_level
			cycle
			success_reward
			id
			proposer {
				address
			}
			governance {
				address
			}
			description
			title
			invoice
			current_round_proposal
			dropped_datetime
			execution_datetime
			defeated_datetime
			locked
			executed
			status
			payment_processed
			min_quorum_percentage
			quorum_smvk_total
			nay_vote_smvk_total
			pass_vote_smvk_total
			yay_vote_smvk_total
			proposal_vote_smvk_total
			source_code
			votes {
				round
				vote
				voter {
					address
					satellites {
						image
						name
					}
				}
			}
			data {
				encoded_code
				governance_proposal_id
				code_description
				id
				title
			}
			payments {
				governance_proposal_id
				id
				internal_id
				title
				to_ {
					address
				}
				token_id
				token_amount
				token {
					token_address
				}
			}
		}
	}
`)

export const CURRENT_PROPOSALS_QUERY = gql(`
		query proposalsDataQuery($timelockProposalId: bigint) {
			governance_proposal(order_by: {start_datetime: desc}, where: {_or: [{current_round_proposal: {_eq: true}}, {_and: [{id: {_eq: $timelockProposalId}}, {_or: [{executed: {_eq: false}}, {payment_processed: {_eq: false}}]}]}]}) {
				current_cycle_end_level
				cycle
				success_reward
				id
				proposer {
					address
				}
				governance {
					address
				}
				description
				title
				invoice
				current_round_proposal
				dropped_datetime
				execution_datetime
				defeated_datetime
				locked
				executed
				status
				payment_processed
				min_quorum_percentage
				quorum_smvk_total
				nay_vote_smvk_total
				pass_vote_smvk_total
				yay_vote_smvk_total
				proposal_vote_smvk_total
				source_code
				votes {
					round
					vote
					voter {
						address
						satellites {
							image
							name
						}
					}
				}
				data {
					encoded_code
					governance_proposal_id
					code_description
					id
					title
				}
				payments {
					governance_proposal_id
					id
					internal_id
					title
					to_ {
						address
					}
					token_id
					token_amount
					token {
						token_address
					}
				}
			}
		}
	`)

export const PROPOSALS_SUBMISSION_QUERY = gql(`
	query submissionProposalsDataquery($userAddress: String) {
		governance_proposal(order_by: {start_datetime: desc}, where: {proposer: {address: {_eq: $userAddress}}, current_round_proposal: {_eq: true}, status: {_eq: 0}}, limit: 2) {
			current_cycle_end_level
			cycle
			success_reward
			id
			proposer {
				address
			}
			governance {
				address
			}
			description
			title
			invoice
			current_round_proposal
			dropped_datetime
			execution_datetime
			defeated_datetime
			locked
			executed
			status
			payment_processed
			min_quorum_percentage
			quorum_smvk_total
			nay_vote_smvk_total
			pass_vote_smvk_total
			yay_vote_smvk_total
			proposal_vote_smvk_total
			source_code
			votes {
				round
				vote
				voter {
					address
					satellites {
						image
						name
					}
				}
			}
			data {
				encoded_code
				governance_proposal_id
				code_description
				id
				title
			}
			payments {
				governance_proposal_id
				id
				internal_id
				title
				to_ {
					address
				}
				token_amount
				token_id
				token {
					token_address
				}
			}
		}
	}
	`)

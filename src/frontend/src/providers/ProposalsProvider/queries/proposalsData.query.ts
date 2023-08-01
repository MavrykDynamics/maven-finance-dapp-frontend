import { gql as apolloGql } from '@apollo/client'

export const getGovernanceProposalsQuery = () => {
  return apolloGql(`
	subscription proposalsDataSubscription {
		governance_proposal(order_by: {start_datetime: desc}) {
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
				token {
					token_address
				}
			}
		}
	}
	`)
}

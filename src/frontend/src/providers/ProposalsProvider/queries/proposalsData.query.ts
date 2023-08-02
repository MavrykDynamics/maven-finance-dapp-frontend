import { PROPOSALS_CURRENT_DATA, PROPOSALS_DATA_SUB, PROPOSALS_PAST_DATA } from './../helpers/proposals.const'
import { DocumentNode, OperationVariables, TypedDocumentNode, gql as apolloGql } from '@apollo/client'
import { ProposalsSubsRecordType } from '../proposals.provider.types'
import { ProposalsDataSubscriptionSubscription } from 'utils/__generated__/graphql'
import { gql } from 'utils/__generated__'

export const getProposalsQuery = ({
  subType,
  isProposalRound,
}: {
  subType: ProposalsSubsRecordType[typeof PROPOSALS_DATA_SUB]
  isProposalRound: boolean
}): DocumentNode | TypedDocumentNode<ProposalsDataSubscriptionSubscription, OperationVariables> => {
  const proposalsFilter =
    subType === PROPOSALS_PAST_DATA
      ? `where: {executed: {_eq: false}, _or: {current_round_proposal: {_eq: false}, _or: {status: {_eq: 1}}}}`
      : subType === PROPOSALS_CURRENT_DATA
      ? isProposalRound
        ? `where: {current_round_proposal: {_eq: true}, status: {_eq: 0}}`
        : ` (where: {_or: [{current_round_proposal: {_eq: true}}, {_and: [{id: {_eq: $timelockProposalId}}, {_or: [{executed: {_eq: false}}, {payment_processed: {_eq: false}}]}]}]})`
      : ``
  return apolloGql(`
	subscription proposalsDataSubscription($timelockProposalId: bigint) {
		governance_proposal(order_by: {start_datetime: desc} ${proposalsFilter}) {
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
}

export const PROPOSALS_SUBMISSION_SUB = gql(`
	subscription submissionProposalsDataSubscription($userAddress: String) {
		governance_proposal(order_by: {start_datetime: desc}, where: {proposer: {address: {_eq: $userAddress}}, current_round_proposal: {_eq: true}}, limit: 2) {
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

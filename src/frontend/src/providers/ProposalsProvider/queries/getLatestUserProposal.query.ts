import { gql } from 'utils/__generated__'

export const GOVERNANCE_LATEST_USER_PROPOSAL_QUERY = gql(`
	query GetGovernanceLatestUserProposalsQuery($userAddress: String = "") {
		governance_proposal(order_by: {start_datetime: desc}, where: { proposer: {address: {_eq: $userAddress}}}) {
			id
		}
	}
`)

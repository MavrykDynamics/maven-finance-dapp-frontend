import { gql } from 'utils/__generated__'

export const PROPOSALS_AMOUNT_SUBSCRIPTION = gql(`
	subscription proposalsAmount {
		governance_proposal_aggregate {
			aggregate {
				count
			}
		}
	}
`)

export const EXECUTED_PROPOSALS_AMOUNT_SUBSCRIPTION = gql(`
	subscription submittedProposalsAmount {
		governance_proposal_aggregate {
			aggregate {
				count
			}
		}
	}
`)

export const FINANCIAL_REQUESTS_AMOUNT_SUBSCRIPTION = gql(`
	subscription finRequestsAmount {
		governance_financial_request_aggregate {
			aggregate {
				count
			}
		}
	}
`)

export const E_GOV_PROPOSALS_AMOUNT_SUBSCRIPTION = gql(`
	subscription eGovProposalsAmount {
		emergency_governance_aggregate {
			aggregate {
				count
			}
		}
	}
`)

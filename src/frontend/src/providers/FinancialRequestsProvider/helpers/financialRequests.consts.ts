import { FinancialRequestsStateType } from '../financialRequests.types'

// actions
export const FINANCIAL_REQUEST_VOTE_ACTION = 'votingFinancialRequestVote'

// CONSTS FOR STAKING PROVIDER STATES
export const ONGOING_FIN_REQUESTS_SUB = 'ongoingFinRequestsSub'
export const PAST_FIN_REQUESTS_SUB = 'pastFinRequestsSub'

// fin request type
export const FIN_REQUSTS_ONGOING = 'ongoing'
export const FIN_REQUSTS_PAST = 'past'

// PROVIDER DEFAULT CONSTS
export const DEFAULT_FINANCIAL_REQUESTS_ACTIVE_SUBS = {
  [ONGOING_FIN_REQUESTS_SUB]: false,
  [PAST_FIN_REQUESTS_SUB]: false,
} as const

export const DEFAULT_FINANCIAL_REQUESTS_CTX: FinancialRequestsStateType = {
  pastFinancialRequestsIds: null,
  ongoingFinancialRequestsIds: null,
  financialRequestsMapper: null,
}
export const EMPTY_FINANCIAL_REQUESTS_CTX: DeepNonNullable<FinancialRequestsStateType> = {
  pastFinancialRequestsIds: [],
  ongoingFinancialRequestsIds: [],
  financialRequestsMapper: {},
}

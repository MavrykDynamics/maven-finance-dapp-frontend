import { FinRequestsSubsRecordType, FinancialRequestsStateType } from '../financialRequests.types'

// actions
export const FINANCIAL_REQUEST_VOTE_ACTION = 'votingFinancialRequestVote'

// CONSTS FOR STAKING PROVIDER STATES
export const ONGOING_FIN_REQUESTS_SUB = 'ongoingFinRequestsSub'
export const PAST_FIN_REQUESTS_SUB = 'pastFinRequestsSub'
export const ALL_FIN_REQUESTS_SUB = 'allFinRequestsSub'

export const FIN_REQUESTS_DATA = 'finRequestsData'

// PROVIDER DEFAULT CONSTS

export const DEFAULT_FIN_REQUESTS_ACTIVE_SUBS: FinRequestsSubsRecordType = {
  [FIN_REQUESTS_DATA]: null,
}

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

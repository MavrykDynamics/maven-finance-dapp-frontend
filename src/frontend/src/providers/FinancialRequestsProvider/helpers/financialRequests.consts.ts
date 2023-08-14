import {
  FinRequestsSubsRecordType,
  FinancialRequestsStateType,
  NullableFinancialRequestsContextStateType,
} from '../financialRequests.types'

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
} as const

export const DEFAULT_FINANCIAL_REQUESTS_CTX: NullableFinancialRequestsContextStateType = {
  allFinRequestsIds: null,
  pastFinRequestsIds: null,
  ongoingFinRequestsIds: null,
  financialRequestsMapper: null,
  closestOngoingFinRequestToBeExpired: null,
}
export const EMPTY_FINANCIAL_REQUESTS_CTX: Omit<FinancialRequestsStateType, 'closestOngoingFinRequestToBeExpired'> = {
  allFinRequestsIds: [],
  pastFinRequestsIds: [],
  ongoingFinRequestsIds: [],
  financialRequestsMapper: {},
}

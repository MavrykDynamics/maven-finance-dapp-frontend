import {
  FinRequestsSubsRecordType,
  FinancialRequestsStateType,
  NullableFinancialRequestsContextStateType,
} from '../financialRequests.provider.types'

// actions
export const FINANCIAL_REQUEST_VOTE_ACTION = 'votingFinancialRequestVote'

// subs consts
export const ONGOING_FIN_REQUESTS_SUB = 'ongoingFinRequestsSub'
export const ALL_FIN_REQUESTS_SUB = 'allFinRequestsSub'

export const FIN_REQUESTS_DATA = 'finRequestsData'

// context consts
export const DEFAULT_FIN_REQUESTS_ACTIVE_SUBS: FinRequestsSubsRecordType = {
  [FIN_REQUESTS_DATA]: null,
} as const

export const DEFAULT_FINANCIAL_REQUESTS_CTX: NullableFinancialRequestsContextStateType = {
  allFinRequestsIds: null,
  pastFinRequestsIds: null,
  ongoingFinRequestsIds: null,
  financialRequestsMapper: null,
}
export const EMPTY_FINANCIAL_REQUESTS_CTX: FinancialRequestsStateType = {
  allFinRequestsIds: [],
  pastFinRequestsIds: [],
  ongoingFinRequestsIds: [],
  financialRequestsMapper: {},
}

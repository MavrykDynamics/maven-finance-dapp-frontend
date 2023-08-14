import {
  FINANCIAL_REQUEST_VOTE_ACTION,
  ONGOING_FIN_REQUESTS_SUB,
  PAST_FIN_REQUESTS_SUB,
  FIN_REQUESTS_DATA,
  ALL_FIN_REQUESTS_SUB,
} from './helpers/financialRequests.consts'
import { FinancialRequestRecord } from './helpers/financialRequests.types'

// actions
export type FinancialRequestsActionsTypes = typeof FINANCIAL_REQUEST_VOTE_ACTION

// subs consts type
export type FinancialRequestsSubsType =
  | typeof ONGOING_FIN_REQUESTS_SUB
  | typeof PAST_FIN_REQUESTS_SUB
  | typeof ALL_FIN_REQUESTS_SUB

// active subs record type (allow only one sub at the time)
export type FinRequestsSubsRecordType = {
  [FIN_REQUESTS_DATA]: FinancialRequestsSubsType | null
}

export type FinancialRequestsStateType = {
  allFinRequestsIds: string[]
  pastFinRequestsIds: string[]
  ongoingFinRequestsIds: string[]
  financialRequestsMapper: Record<string, FinancialRequestRecord>
  closestOngoingFinRequestToBeExpired: FinancialRequestRecord
}

export type NullableFinancialRequestsContextStateType = DeepNullable<FinancialRequestsStateType>

export type FinancialRequestsContext = Omit<FinancialRequestsStateType, 'closestOngoingFinRequestToBeExpired'> & {
  isLoading: boolean

  changeFinancialRequestsSubscriptionList: (skips: Partial<FinRequestsSubsRecordType>) => void
}

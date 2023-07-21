import {
  FIN_REQUSTS_ONGOING,
  FIN_REQUSTS_PAST,
  ONGOING_FIN_REQUESTS_SUB,
  PAST_FIN_REQUESTS_SUB,
} from './helpers/financialRequests.consts'
import { FinancialRequestRecord } from './helpers/financialRequests.types'

export type FinancialRequestsSubsType = typeof ONGOING_FIN_REQUESTS_SUB | typeof PAST_FIN_REQUESTS_SUB

export type FinancialRequestsStateType = {
  pastFinancialRequestsIds: string[] | null
  ongoingFinancialRequestsIds: string[] | null
  financialRequestsMapper: Record<string, FinancialRequestRecord> | null
}

export type FinancialRequestsContext = DeepNonNullable<FinancialRequestsStateType> & {
  isLoading: boolean

  changeFinancialRequestsSubscriptionList: (skips: Partial<FinancialRequestsSubsRecordType>) => void
}

export type FinancialRequestsSubsRecordType = Record<FinancialRequestsSubsType, boolean>

export type FinancialRequestType = typeof FIN_REQUSTS_PAST | typeof FIN_REQUSTS_ONGOING

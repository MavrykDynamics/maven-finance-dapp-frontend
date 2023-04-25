import { GET_FINANCIAL_REQUEST_STORAGE } from 'pages/FinacialRequests/FinancialRequest.actions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import { normalizeFinancialRequests } from 'pages/FinacialRequests/FinancialRequests.helpers'

export type FinancialRequestStoreType = ReturnType<typeof normalizeFinancialRequests> & {
  isLoaded: boolean
}

const financialReqDefaultState: FinancialRequestStoreType = {
  financialRequestsIds: [],
  financialRequestMapper: {},
  isLoaded: false,
}

export function financialRequest(state = financialReqDefaultState, action: Action) {
  switch (action.type) {
    case GET_FINANCIAL_REQUEST_STORAGE:
      return {
        ...state,
        isLoaded: true,
        financialRequestsIds: action.financialRequestsIds,
        financialRequestMapper: action.financialRequestMapper,
      }
    default:
      return state
  }
}

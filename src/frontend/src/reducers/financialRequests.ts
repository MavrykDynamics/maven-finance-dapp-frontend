import { GET_FINANCIAL_REQUEST_STORAGE } from 'pages/FinacialRequests/FiancialRequest.actions'
import { FinancialRequestRecord } from 'utils/TypesAndInterfaces/Governance'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export type FinancialRequestStoreType = {
  financialRequests: Array<FinancialRequestRecord>
  isLoaded: boolean
}

const financialReqDefaultState: FinancialRequestStoreType = {
  financialRequests: [],
  isLoaded: false,
}

export function financialRequest(state = financialReqDefaultState, action: Action) {
  switch (action.type) {
    case GET_FINANCIAL_REQUEST_STORAGE:
      return {
        ...state,
        isLoaded: true,
        financialRequests: action.financialRequests,
      }
    default:
      return state
  }
}

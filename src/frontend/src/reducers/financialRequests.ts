import { GET_FINANCIAL_REQUEST_STORAGE } from 'pages/FinacialRequests/FiancialRequest.actions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export type FinancialRequestStoreType = {
  financialRequests: Array<any>
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

import { GET_LOANS_STORAGE } from 'pages/Loans/Loans.actions'
import { LoansChartsDataType, LoansStorage } from 'utils/TypesAndInterfaces/Loans'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface LoansState {
  loanTokens: LoansStorage['loanTokens']
  chartsData: LoansChartsDataType
}

const loansDefaultState: LoansState = {
  loanTokens: [],
  chartsData: {
    totalBorrowed: 0,
    borrowingChartData: [],
    totalLended: 0,
    lendingChartData: [],
  },
}

export function loans(state = loansDefaultState, action: Action) {
  switch (action.type) {
    case GET_LOANS_STORAGE:
      return {
        ...state,
        ...action.loansStorage,
      }
    default:
      return state
  }
}

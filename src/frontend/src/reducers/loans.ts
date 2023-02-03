import { GET_LOANS_STORAGE, CLEAR_LOANS_STORAGE } from 'pages/Loans/Actions/getLoansData.actions'
import { LoansChartsDataType, LoansStorage, XtzBakerType } from 'utils/TypesAndInterfaces/Loans'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface LoansState {
  loanTokens: LoansStorage['loanTokens']
  chartsData: LoansChartsDataType
  loansControllerAddress: string
  xtzBakers: Array<XtzBakerType>
  isDataLoaded: boolean
}

const loansDefaultState: LoansState = {
  loanTokens: [],
  loansControllerAddress: '',
  chartsData: {
    totalBorrowed: 0,
    borrowingChartData: [],
    totalLended: 0,
    lendingChartData: [],
  },
  xtzBakers: [],
  isDataLoaded: false
}

export function loans(state = loansDefaultState, action: Action) {
  switch (action.type) {
    case GET_LOANS_STORAGE:
      return {
        ...state,
        ...action.loansStorage,
        isDataLoaded: true
      }
    case CLEAR_LOANS_STORAGE:
      return {
        ...state,
        ...loansDefaultState,
      }
    default:
      return state
  }
}

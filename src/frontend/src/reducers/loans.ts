import { GET_LOANS_STORAGE, RESET_FETCHED } from 'pages/Loans/Loans.actions'
import {
  AvaliableCollateralType,
  LoansChartsDataType,
  LoansStorage,
  XtzBakerType,
} from 'utils/TypesAndInterfaces/Loans'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface LoansState {
  loanTokens: LoansStorage['loanTokens']
  chartsData: LoansChartsDataType
  loansControllerAddress: string
  xtzBakers: Array<XtzBakerType>
  isFetched: boolean
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
  isFetched: false,
}

export function loans(state = loansDefaultState, action: Action) {
  switch (action.type) {
    case GET_LOANS_STORAGE:
      return {
        ...state,
        ...action.loansStorage,
        isFetched: true,
      }
    case RESET_FETCHED:
      return {
        ...state,
        isFetched: false,
      }
    default:
      return state
  }
}

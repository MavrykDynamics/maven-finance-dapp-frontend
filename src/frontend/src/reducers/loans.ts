import { GET_LOANS_STORAGE, TOGGLE_LOANS_MODAL } from 'pages/Loans/Loans.actions'
import {
  BorrowingData,
  LendingItemType,
  LoansChartsDataType,
  LoansStorage,
  ModalTypes,
} from 'utils/TypesAndInterfaces/Loans'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface LoansState {
  loanTokens: LoansStorage['loanTokens']
  lendingItem: LendingItemType | null
  chartsData: LoansChartsDataType
  currentModalActive: ModalTypes
  borrowingsList: Array<BorrowingData>
}

const loansDefaultState: LoansState = {
  loanTokens: [],
  borrowingsList: [],
  lendingItem: null,
  currentModalActive: null,
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
    case TOGGLE_LOANS_MODAL:
      return {
        ...state,
        currentModalActive: action.modalToShow,
      }
    default:
      return state
  }
}

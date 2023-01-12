import { GET_LOANS_STORAGE, TOGGLE_LOANS_MODAL } from 'pages/Loans/Loans.actions'
import { ADD_NEW_COLLATERAL_MODAL_ID } from 'pages/Loans/Loans.const'
import { LoansChartsDataType, LoansStorage, ModalTypes } from 'utils/TypesAndInterfaces/Loans'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface LoansState {
  loanTokens: LoansStorage['loanTokens']
  chartsData: LoansChartsDataType
  currentModalActive: ModalTypes
  loansControllerAddress: string
}

const loansDefaultState: LoansState = {
  loanTokens: [],
  currentModalActive: ADD_NEW_COLLATERAL_MODAL_ID,
  loansControllerAddress: '',
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
        ...action.payload,
      }
    default:
      return state
  }
}

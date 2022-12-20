import { GET_LOANS_STORAGE } from 'pages/Loans/Loans.actions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface LoansState {
  loanAssets: Array<string>
}

const loansDefaultState: LoansState = {
  loanAssets: [],
}

export function loans(state = loansDefaultState, action: Action) {
  switch (action.type) {
    case GET_LOANS_STORAGE:
      console.log(action)

      return {
        ...state,
        ...action.loansStorage,
      }
    default:
      return state
  }
}

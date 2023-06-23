import { GET_LOANS_STORAGE } from 'pages/Loans/Actions/getLoansData.actions'
import { LoansStorage, VaultsStorage } from 'utils/TypesAndInterfaces/Loans'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface LoansState {
  loanTokens: LoansStorage['loanTokens']
  vaults: VaultsStorage
  mvkTokenOperators: LoansStorage['mvkTokenOperators']

  config: {
    DAOFee: number
  }

  isDataLoaded: boolean
}

const loansDefaultState: LoansState = {
  loanTokens: [],
  vaults: {
    permissinedVaultsIds: [],
    myVaultsIds: [],
    allVaultsIds: [],
    vaultsMapper: {},
  },
  mvkTokenOperators: [],
  config: {
    DAOFee: 0,
  },
  isDataLoaded: false,
}

export function loans(state = loansDefaultState, action: Action) {
  switch (action.type) {
    case GET_LOANS_STORAGE:
      return {
        ...state,
        ...action.loansStorage,
        isDataLoaded: true,
      }
    default:
      return state
  }
}

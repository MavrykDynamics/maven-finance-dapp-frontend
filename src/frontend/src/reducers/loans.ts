import { GET_LOANS_STORAGE } from 'pages/Loans/Actions/getLoansData.actions'
import { VaultsStorage } from 'utils/TypesAndInterfaces/Loans'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface LoansState {
  vaults: VaultsStorage
  isDataLoaded: boolean
}

const loansDefaultState: LoansState = {
  vaults: {
    permissinedVaultsIds: [],
    myVaultsIds: [],
    allVaultsIds: [],
    vaultsMapper: {},
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

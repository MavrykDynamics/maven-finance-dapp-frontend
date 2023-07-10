import { GET_LOANS_STORAGE } from 'pages/Loans/Actions/getLoansData.actions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import { normalizeVaultsStorage } from 'pages/Vaults/Vaults.normalizer'

export interface LoansState {
  vaults: Awaited<ReturnType<typeof normalizeVaultsStorage>>
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

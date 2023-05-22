import { GET_LOANS_STORAGE } from 'pages/Loans/Actions/getLoansData.actions'
import { LoansChartsDataType, LoansStorage, VaultsStorage } from 'utils/TypesAndInterfaces/Loans'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface LoansState {
  loanTokens: LoansStorage['loanTokens']
  vaults: VaultsStorage
  chartsData: LoansChartsDataType

  config: {
    DAOFee: number
    loansControllerAddress: string
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
  chartsData: {
    borrowingChartData: [],
    collateralChartData: [],
    lendingChartData: [],
    lendBorrow24hDiff: {
      last48hLending: 0,
      last24hLending: 0,
      last48hBorrowing: 0,
      last24hBorrowing: 0,
    },
  },
  config: {
    DAOFee: 0,
    loansControllerAddress: '',
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

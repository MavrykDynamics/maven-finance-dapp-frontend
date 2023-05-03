import { GET_LOANS_STORAGE } from 'pages/Loans/Actions/getLoansData.actions'
import { LoansChartsDataType, LoansStorage } from 'utils/TypesAndInterfaces/Loans'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import { VaultsStorage } from 'utils/TypesAndInterfaces/Vaults'

export interface LoansState {
  loanTokens: LoansStorage['loanTokens']
  chartsData: LoansChartsDataType
  vaults: VaultsStorage
  loansControllerAddress: string
  isDataLoaded: boolean
  config: {
    DAOFee: number
  }
}

const loansDefaultState: LoansState = {
  loanTokens: [],
  vaults: {
    permissinedVaultsIds: [],
    myVaultsIds: [],
    allVaultsIds: [],
    vaultsMapper: {},
  },
  loansControllerAddress: '',
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

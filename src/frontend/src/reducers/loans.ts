import { GET_LOANS_STORAGE, CLEAR_LOANS_STORAGE } from 'pages/Loans/Actions/getLoansData.actions'
import { LoansChartsDataType, LoansStorage, XtzBakersType } from 'utils/TypesAndInterfaces/Loans'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface LoansState {
  loanTokens: LoansStorage['loanTokens']
  chartsData: LoansChartsDataType
  loansControllerAddress: string
  xtzBakers: XtzBakersType
  isDataLoaded: boolean
  config: {
    DAOFee: number
  }
}

const loansDefaultState: LoansState = {
  loanTokens: [],
  loansControllerAddress: '',
  chartsData: {
    totalBorrowed: 0,
    borrowingChartData: [],
    collateralChartData: [],
    totalLended: 0,
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
  xtzBakers: {
    otherBakers: [],
    dao: null,
    mavrykDynamics: null,
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
    case CLEAR_LOANS_STORAGE:
      return {
        ...state,
        ...loansDefaultState,
      }
    default:
      return state
  }
}

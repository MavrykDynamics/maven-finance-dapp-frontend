
import { ChartPlotType } from 'app/App.components/Chart/Chart.view'
import { GET_LOANS_STORAGE } from 'pages/Loans/Loans.actions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export type LoansChartsDataType = {
  totalBorrowed: number
  borrowingChartData: Array<ChartPlotType>
  totalLended: number
  lendingChartData: Array<ChartPlotType>
}

export interface LoansState {
  loanAssets: Array<string>
  chartsData: LoansChartsDataType
}

const loansDefaultState: LoansState = {
  loanAssets: [],
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
    default:
      return state
  }
}

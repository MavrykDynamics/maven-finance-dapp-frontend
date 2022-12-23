import { ChartPlotType } from 'app/App.components/Chart/Chart.view'
import { normalizeLoans } from 'pages/Loans/Loans.helpers'
import { Lending_Controller } from 'utils/generated/graphqlTypes'

export type LoansGQL = Omit<Lending_Controller, '__typename'>
export type LoansStorage = ReturnType<typeof normalizeLoans>

export type LoanTokenType = {
  loanTokenData: {
    name: string
    symbol: string
    decimals: string
    icon: string
    rate?: number
  }
  utilisationRate: number
  totalBorrowed: number
  totalLended: number
}

export type LoansChartsDataType = {
  totalBorrowed: number
  borrowingChartData: Array<ChartPlotType>
  totalLended: number
  lendingChartData: Array<ChartPlotType>
}

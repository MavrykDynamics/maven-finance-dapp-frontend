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
  transactionHistory: Array<{
    descr: string | null
    amount: number
    date: string | null
    userAddress: string
    operationHash: string
    tokenSymbol: string | undefined
  }>
  utilisationRate: number
  borrowers: number
  suppliers: number
  collateral: number
  reserveRatio: number
  totalBorrowed: number
  avaliableLiquidity: number
  totalLended: number
}

export type LoansChartsDataType = {
  totalBorrowed: number
  borrowingChartData: Array<ChartPlotType>
  totalLended: number
  lendingChartData: Array<ChartPlotType>
}

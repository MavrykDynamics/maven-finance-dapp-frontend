import { SingleValueData } from 'lightweight-charts'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'

// Loans chart custom hook types
export type LoansChartsType = {
  calcTotalLendingChart?: boolean
  calcTotalBorrowingChart?: boolean
  calcTotalCollateralChart?: boolean
  calcMarketBorrowChart?: boolean
  calcMarketLendingChart?: boolean
}

export type LoansMarketMiniChartType = { total: Array<SingleValueData>; volume: Array<SingleValueData> }

export type UseLoansChartsStateType = {
  totalLendingChart: Array<SingleValueData>
  totalBorrowingChart: Array<SingleValueData>
  totalCollateralChart: Array<SingleValueData>
  marketBorrowChart: Record<TokenAddressType, LoansMarketMiniChartType>
  marketLendingChart: Record<TokenAddressType, LoansMarketMiniChartType>
}

// Loans market transaction history custom hook type
export type LoansMarketTransactionHistoryType = {
  descr: string | null
  amount: number
  usdValue: number
  date: string | null
  userAddress: string
  symbol: string
  vaultAddress?: string
  operationHash: string
  tokenAddress: TokenAddressType
}

export type LoansMarketTransactionHistoryArgs = {
  marketTokenAddress: TokenAddressType
  userAddress?: string
  vaultAddress?: string
  typeFilter?: Array<number>
}

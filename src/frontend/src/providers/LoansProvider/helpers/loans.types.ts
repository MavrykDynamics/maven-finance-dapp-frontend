import { SingleValueData } from 'lightweight-charts'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'

// Loans chart custom hook types
export type LoansChartsType = {
  calcTotalLendingChart?: boolean
  calcTotalBorrowingChart?: boolean
  calcTotalCollateralChart?: boolean
  calcMarketCollateralChart?: boolean
  calcMarketLendingChart?: boolean
}

export type UseLoansChartsStateType = {
  totalLendingChart: Array<SingleValueData>
  totalBorrowingChart: Array<SingleValueData>
  totalCollateralChart: Array<SingleValueData>
  marketCollateralChart: Record<TokenAddressType, Array<SingleValueData>>
  marketLendingChart: Record<TokenAddressType, Array<SingleValueData>>
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
}

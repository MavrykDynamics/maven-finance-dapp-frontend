import { SingleValueData } from 'lightweight-charts'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'

export type LoansMarketMiniChartType = { total: Array<SingleValueData>; volume: Array<SingleValueData> }

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

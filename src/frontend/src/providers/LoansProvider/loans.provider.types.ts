import { VAULT_ALLOWANCE_ACCOUNTS, VAULT_ALLOWANCE_ANY } from 'pages/Loans/Loans.const'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import {
  LOANS_MARKETS_DATA,
  LOANS_CONFIG,
  DEPOSIT_LENDING_ASSET_ACTION,
  WITHDRAW_LENDING_ASSET_ACTION,
} from './helpers/loans.const'
import { SingleValueData } from 'lightweight-charts'
import { LoansMarketMiniChartType } from './helpers/loans.types'

export type LoanVaultAllowanceType = typeof VAULT_ALLOWANCE_ANY | typeof VAULT_ALLOWANCE_ACCOUNTS

export type LoansActionsType = typeof DEPOSIT_LENDING_ASSET_ACTION | typeof WITHDRAW_LENDING_ASSET_ACTION

export type LoansSubsType = typeof LOANS_MARKETS_DATA | typeof LOANS_CONFIG
export type LoansSubsRecordType = Record<LoansSubsType, boolean>

export type LendingItemType = {
  lendValue: number
  interestEarned: number
} | null

// Market Type
export type LoanMarketType = {
  loanTokenAddress: TokenAddressType // address of the market token
  loanMTokenAddress: TokenAddressType // address of the market mToken

  utilisationRate: number
  borrowers: number // amount of vaults for market
  suppliers: number // amount of people who hold market mToken
  borrowAPR: number
  lendingAPY: number

  availableLiquidity: number // how much tokens left in the market pool
  totalBorrowed: number // how much borrowed per market
  totalLended: number // now much supplied to market pool
  totalRewards: number // now much suppliers have earned rewards for supplying into the pool

  reserveFactor: number
  reserveAmount: number
}

export type LoansChartsType = {
  totalLendingChart: Array<SingleValueData>
  totalBorrowingChart: Array<SingleValueData>
  totalCollateralChart: Array<SingleValueData>
  marketBorrowChart: Record<TokenAddressType, LoansMarketMiniChartType>
  marketLendingChart: Record<TokenAddressType, LoansMarketMiniChartType>
}

export type LoansContext = LoansContextState & {
  isLoading: boolean

  changeLoansSubscriptionsList: (skips: Partial<LoansSubsRecordType>) => void
  setMarketAddressToSubscribe: (marketTokenAddress: TokenAddressType | null) => void
  setLoansChartsData: (newchartsData: LoansChartsType) => void
}

export type LoansContextState = {
  allMarketsAddresses: Array<TokenAddressType>
  marketsAddresses: Array<TokenAddressType>
  marketsMapper: Record<TokenAddressType, LoanMarketType>
  config: {
    daoFee: number
    collateralFactor: number
  }
  chartsData: LoansChartsType | null
}

export type NullableLoansContextState = DeepNullable<LoansContextState>

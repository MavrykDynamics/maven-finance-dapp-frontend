import { VAULT_ALLOWANCE_ACCOUNTS, VAULT_ALLOWANCE_ANY } from 'pages/Loans/Loans.const'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import { LOANS_MARKETS_ADDRESSES, LOANS_MARKETS_DATA, LOANS_CONFIG } from './helpers/loans.const'

// export type MvkTokenOperatorGQL = Omit<Mvk_Token_Operator, '__typename'>
// export type LendingControllerGQL = Omit<Lending_Controller, '__typename'>
// export type LoansStorage = Awaited<ReturnType<typeof normalizeLoans>>
// export type VaultsStorage = Awaited<ReturnType<typeof normalizeVaultsStorage>>

export type LoanVaultAllowanceType = typeof VAULT_ALLOWANCE_ANY | typeof VAULT_ALLOWANCE_ACCOUNTS

export type LoansSubsType = typeof LOANS_MARKETS_ADDRESSES | typeof LOANS_MARKETS_DATA | typeof LOANS_CONFIG
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

  reserveFactor: number
  reserveAmount: number
}

export type LoansContext = {
  marketsAddresses: Array<TokenAddressType>
  marketsMapper: Record<TokenAddressType, LoanMarketType>
  config: {
    daoFee: number
    collateralFactor: number
  }

  isLoading: boolean

  changeLoansSubscriptionsList: (skips: Partial<LoansSubsRecordType>) => void
  setMarketAddressToSubscribe: (marketTokenAddress: TokenAddressType | null) => void
}

export type LoansContextState = Pick<LoansContext, 'marketsAddresses' | 'marketsMapper' | 'config'>

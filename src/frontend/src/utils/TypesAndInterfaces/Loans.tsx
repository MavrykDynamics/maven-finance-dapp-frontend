import { VAULT_ALLOWANCE_ACCOUNTS, VAULT_ALLOWANCE_ANY } from 'pages/Loans/Loans.const'
import { Lending_Controller, Mvk_Token_Operator } from 'utils/generated/graphqlTypes'
import { normalizeVaultsStorage } from 'pages/Vaults/Vaults.normalizer'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'

export type MvkTokenOperatorGQL = Omit<Mvk_Token_Operator, '__typename'>
export type LendingControllerGQL = Omit<Lending_Controller, '__typename'>
export type VaultsStorage = Awaited<ReturnType<typeof normalizeVaultsStorage>>

export type LoanVaultAllowanceType = typeof VAULT_ALLOWANCE_ANY | typeof VAULT_ALLOWANCE_ACCOUNTS

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
  collateralFactor: number

  availableLiquidity: number // how much tokens left in the market pool
  totalBorrowed: number // how much borrowed per market
  totalLended: number // now much supplied to market pool

  reserveFactor: number
  reserveAmount: number
}

type TokenOperator = {
  owner: string
  operator: string
  token_id: number
}

export type UpdateTokenOperator = {
  add_operator?: TokenOperator
  remove_operator?: TokenOperator
}

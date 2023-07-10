import { VAULT_ALLOWANCE_ACCOUNTS, VAULT_ALLOWANCE_ANY } from 'pages/Loans/Loans.const'
import { Lending_Controller, Mvk_Token_Operator } from 'utils/generated/graphqlTypes'
import { normalizeVaultsStorage } from 'pages/Vaults/Vaults.normalizer'

export type MvkTokenOperatorGQL = Omit<Mvk_Token_Operator, '__typename'>
export type LendingControllerGQL = Omit<Lending_Controller, '__typename'>
export type VaultsStorage = Awaited<ReturnType<typeof normalizeVaultsStorage>>

export type LoanVaultAllowanceType = typeof VAULT_ALLOWANCE_ANY | typeof VAULT_ALLOWANCE_ACCOUNTS

export type LendingItemType = {
  lendValue: number
  interestEarned: number
} | null

type TokenOperator = {
  owner: string
  operator: string
  token_id: number
}

export type UpdateTokenOperator = {
  add_operator?: TokenOperator
  remove_operator?: TokenOperator
}

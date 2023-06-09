import {
  ANY_USER,
  NONE_USER,
  VAULT_ALLOWANCE_ACCOUNTS,
  VAULT_ALLOWANCE_ANY,
  WHITELIST_USERS,
} from 'pages/Loans/Loans.const'
import { Lending_Controller, Mvk_Token_Operator } from 'utils/generated/graphqlTypes'
import { normalizeLoans } from 'pages/Loans/Loans.normalizer'
import { normalizeVaultsStorage } from 'pages/Vaults/Vaults.normalizer'
import { TokenAddress } from 'providers/TokensProvider/tokens.provider.types'

export type MvkTokenOperatorGQL = Omit<Mvk_Token_Operator, '__typename'>
export type LendingControllerGQL = Omit<Lending_Controller, '__typename'>
export type LoansStorage = Awaited<ReturnType<typeof normalizeLoans>>
export type VaultsStorage = Awaited<ReturnType<typeof normalizeVaultsStorage>>

export type LoanVaultAllowanceType = typeof VAULT_ALLOWANCE_ANY | typeof VAULT_ALLOWANCE_ACCOUNTS

export type CollateralType = {
  amount: number
  tokenAddress: TokenAddress
}

export type LendingItemType = {
  lendValue: number
  interestEarned: number
  mBalance: number
} | null

export type UserLendObjType = {
  amount: number
  id: number
  annualPecentage: number
  date: string
  operationHash: string
  tokenAddress: TokenAddress
}

export type DepositorsFlagType = typeof ANY_USER | typeof NONE_USER | typeof WHITELIST_USERS

// Vault type
export type LoansVaultType = {
  borrowedTokenAddress: TokenAddress
  collateralData: Array<CollateralType>
  borrowedAmount: number
  minimumRepay: number
  availableLiquidity: number
  apr: number
  fee: number
  address: string
  name: string
  vaultId: number
  xtzDelegatedTo: string | null
  sMVKDelegatedTo?: string
  levelOfEarly?: number
  levelOfLate?: number
  depositors: Array<string>
  deporsitorsFlag: DepositorsFlagType

  // Additional fields for vaults page
  ownerId: string
  creationTimestamp?: string
  liquidationMax: number
  liquidationReward: number
  adminLiquidateFee: number
  liquidationPrice?: number
}

// Market Type
export type LoanMarketType = {
  loanTokenAddress: TokenAddress
  loanMTokenAddress: TokenAddress

  utilisationRate: number
  borrowers: number
  borrowAPR: number
  lendingAPY: number
  collateralFactor: number

  availableLiquidity: number
  totalBorrowed: number
  totalLended: number

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

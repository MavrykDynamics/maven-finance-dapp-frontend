import { AreaChartPlotType } from 'app/App.components/Chart/helpers/Chart.types'
import { SingleValueData } from 'lightweight-charts'
import {
  ANY_USER,
  NONE_USER,
  VAULT_ALLOWANCE_ACCOUNTS,
  VAULT_ALLOWANCE_ANY,
  WHITELIST_USERS,
} from 'pages/Loans/Loans.const'
import { Lending_Controller } from 'utils/generated/graphqlTypes'
import { TokenType } from './General'
import { normalizeLoans } from 'pages/Loans/Loans.normalizer'
import { normalizeVaultsStorage } from 'pages/Vaults/Vaults.normalizer'

export type LoansGQL = Omit<Lending_Controller, '__typename'>
export type LoansStorage = Awaited<ReturnType<typeof normalizeLoans>>
export type VaultsStorage = Awaited<ReturnType<typeof normalizeVaultsStorage>>

export type LoanVaultAllowanceType = typeof VAULT_ALLOWANCE_ANY | typeof VAULT_ALLOWANCE_ACCOUNTS

export type BaseLoansAssetDataType = {
  gqlName: string
  name: string
  rate: number
  decimals: number
  id: number
  symbol: string
  icon: string
}

export type LoansAssetDataType = BaseLoansAssetDataType & {
  tokenType: TokenType
  address: string
}

export type CollateralType = BaseLoansAssetDataType & {
  amount: number
  collateralShare?: number
}

export type LoansChartsDataType = {
  borrowingChartData: Array<SingleValueData>
  collateralChartData: Array<SingleValueData>
  lendingChartData: Array<SingleValueData>
  lendBorrow24hDiff: {
    last24hLending: number
    last24hBorrowing: number
  }
}

export type LendingItemType = {
  lendValue: number
  interestEarned: number
  mBalance: number
} | null

export type AvaliableCollateralType = LoansAssetDataType & {
  address: string
  isProtected: boolean
  tokenType: 'tez' | 'fa12' | 'fa2'
}

export type XtzBakerType = {
  logo: string
  name: string
  address: string
  fee: number
  yield: number
  efficiency: number
  freespace: number
}

export type UserLendObjType = {
  icon: string
  amount: number
  usdAmount: number
  id: number
  annualPecentage: number
  symbol: string
  date: string
  operationHash: string
}

export type DepositorsFlagType = typeof ANY_USER | typeof NONE_USER | typeof WHITELIST_USERS
export type LoansVaultType = {
  borrowedAsset: LoansAssetDataType
  collateralData: Array<CollateralType>
  borrowedAmount: number
  collateralBalance: number
  collateralRatio: number
  minimumRepay: number
  borrowCapacity: number
  availableLiquidity: number
  apr: number
  fee: number
  address: string
  name: string
  vaultId: number
  xtzDelegatedTo: string | null
  operators?: Array<string>
  sMVKDelegatedTo?: string
  levelOfEarly?: number
  levelOfLate?: number
  depositors: Array<string>
  deporsitorsFlag: DepositorsFlagType

  // Additional fields for vaults page
  status: string
  ownerId: string
  creationTimestamp?: string
  liquidationMax: number
  liquidationReward: number
  adminLiquidateFee: number
  liquidationPrice?: number
}

export type LoanMarketType = {
  loanTokenData: LoansAssetDataType & { address: string }
  transactionHistory: Array<{
    descr: string | null
    amount: number
    date: string | null
    userAddress: string
    operationHash: string
    tokenSymbol: string | undefined
  }>
  lendingItem: LendingItemType
  marketCollateralChartData: Array<AreaChartPlotType>
  marketLiquidityChartData: Array<AreaChartPlotType>
  utilisationRate: number
  borrowers: number
  suppliers: number
  totalBorrowed: number
  availableLiquidity: number
  totalLended: number
  borrowAPR: number
  totalFeesEarned: number
  lendingAPY: number
  collateralFactor: number
  reserveFactor: number
  reserveAmount: number
  lending24hVolume: number
  borrowing24hVolume: number
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

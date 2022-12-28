import { ChartPlotType } from 'app/App.components/Chart/Chart.view'
import {
  UPDATE_MVK_OPERATORS_MODAL_ID,
  MANAGE_PERMISSIONS_MODAL_ID,
  BORROW_ASSET_MODAL_ID,
  ADD_COLLATERAL_MODAL_ID,
  CLOSE_VAULT_MODAL_ID,
  REMOVE_COLLATERAL_MODAL_ID,
  REPAY_MODAL_ID,
} from 'pages/Loans/Loans.const'
import { normalizeLoans } from 'pages/Loans/Loans.helpers'
import { Lending_Controller, Lending_Controller_Vault } from 'utils/generated/graphqlTypes'

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
  lendingItem: LendingItemType
  borrowingList: Array<BorrowingData>
  utilisationRate: number
  borrowers: number
  suppliers: number
  collateral: number
  vaultsBorrowedAmount: number
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

export type LendingItemType = {
  assetName: string
  assetIcon?: string
  lendValue: number
  lendAssetRate: number
  lendAPY: number
  interestEarned: number
  loanAssetWalletBalance: number
  mXTZBalance: number
} | null

export type ModalTypes =
  | typeof UPDATE_MVK_OPERATORS_MODAL_ID
  | typeof MANAGE_PERMISSIONS_MODAL_ID
  | typeof ADD_COLLATERAL_MODAL_ID
  | typeof REMOVE_COLLATERAL_MODAL_ID
  | typeof BORROW_ASSET_MODAL_ID
  | typeof REPAY_MODAL_ID
  | typeof CLOSE_VAULT_MODAL_ID
  | null

export type BorrowingData = {
  borrowedAsset: {
    assetSymbol: string
    assetIcon?: string
    amtBorrowed: number
    assetRate: number
    collateralBalance: number
    collateralUtilization: number
    apy: number
    fee: number
  }
  collateralData: Array<{
    assetSymbol: string
    assetIcon?: string
    balance: number
    assetRate: number
    maxWithdraw: number
  }>
  xtzDelegatedTo?: string
  operators?: Array<string>
  sMVKDelegatedTo?: string
  depositors?: string | Array<string>
}

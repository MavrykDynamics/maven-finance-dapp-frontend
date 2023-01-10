import { ChartPlotType } from 'app/App.components/Chart/Chart.view'
import {
  ADD_COLLATERAL_MODAL_ID,
  ADD_LENDING_ASSET_MODAL_ID,
  BORROW_ASSET_MODAL_ID,
  CHANGE_BAKER_MODAL_ID,
  CREATE_NEW_VAULT_MODAL_ID,
  MANAGE_PERMISSIONS_MODAL_ID,
  REMOVE_ASSET_LENDING_MODAL_ID,
  WITHDRAW_COLLATERAL_MODAL_ID,
  UPDATE_MVK_OPERATORS_MODAL_ID,
  REPAY_AND_CLOSE_MODAL_ID,
  REPAY_MODAL_ID,
  ADD_NEW_COLLATERAL_MODAL_ID,
} from 'pages/Loans/Loans.const'
import { normalizeLoans } from 'pages/Loans/Loans.helpers'
import { Lending_Controller, Lending_Controller_Vault } from 'utils/generated/graphqlTypes'

export type LoansGQL = Omit<Lending_Controller, '__typename'>
export type LoansStorage = Awaited<ReturnType<typeof normalizeLoans>>

export type LoanTokenType = {
  loanTokenData: {
    name: string
    symbol?: string
    decimals: number
    icon?: string
    rate: number | null
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
  myBorrowingList: Array<BorrowingData>
  permissinedBorrowingList: Array<BorrowingData>
  utilisationRate: number
  borrowers: number
  suppliers: number
  collateral: number
  vaultsBorrowedAmount: number
  totalBorrowed: number
  avaliableLiquidity: number
  totalLended: number
  borrowAPR: number
  totalFeesEarned: number
  lendingAPY: number
  collateralFactor: number
  reserveFactor: number
  reserveAmount: number
}

export type LoansChartsDataType = {
  totalBorrowed: number
  borrowingChartData: Array<ChartPlotType>
  totalLended: number
  lendingChartData: Array<ChartPlotType>
}

export type LendingItemType = {
  lendValue: number
  lendAPY: number
  interestEarned: number
  loanAssetWalletBalance: number
  mXTZBalance: number
} | null

export type ModalTypes =
  | typeof ADD_COLLATERAL_MODAL_ID
  | typeof ADD_LENDING_ASSET_MODAL_ID
  | typeof ADD_NEW_COLLATERAL_MODAL_ID
  | typeof BORROW_ASSET_MODAL_ID
  | typeof CHANGE_BAKER_MODAL_ID
  | typeof CREATE_NEW_VAULT_MODAL_ID
  | typeof MANAGE_PERMISSIONS_MODAL_ID
  | typeof REMOVE_ASSET_LENDING_MODAL_ID
  | typeof WITHDRAW_COLLATERAL_MODAL_ID
  | typeof UPDATE_MVK_OPERATORS_MODAL_ID
  | typeof REPAY_AND_CLOSE_MODAL_ID
  | typeof REPAY_MODAL_ID
  | null

export type BorrowingData = {
  borrowedAsset: {
    assetSymbol?: string
    assetName?: string
    assetIcon?: string
    amtBorrowed: number
    assetRate: number | null
    collateralBalance: number
    collateralUtilization: number
    apy: number
    fee: number
  }
  collateralData: Array<{
    assetSymbol?: string
    assetIcon?: string
    balance: number
    assetRate: number | null
    maxWithdraw: number
  }>
  xtzDelegatedTo?: string
  operators?: Array<string>
  sMVKDelegatedTo?: string
  depositors?: Array<string>
}

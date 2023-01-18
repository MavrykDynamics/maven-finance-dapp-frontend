import { ChartPlotType } from 'app/App.components/Chart/Chart.view'
import { assertName } from 'graphql'
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
    tokenType: 'tez' | 'fa12' | 'fa2'
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
  permissionedBorrowingList: Array<BorrowingData>
  utilisationRate: number
  borrowers: number
  suppliers: number
  loanTokenTotalCollaterals: number
  loanTokenVaultsTotalBorrowed: number
  totalBorrowed: number
  availableLiquidity: number
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
  borrowAPR: number
  interestEarned: number
  loanAssetWalletBalance: number
  mBalance: number
} | null

export type AvaliableCollateralType = {
  id: number
  userBalance: number
  assetDecimals: number
  assetRate: number | null
  assetName: string
  assetSymbol: string
  assetIcon: string
  assetAddress: string
  isProtected: boolean
  tokenType: 'tez' | 'fa12' | 'fa2'
}

export type XtzBakerType = {
  rank: number
  logo: string
  name: string
  address: string
  fee: number
  lifetime: number
  yield: number
  efficiency: number
  efficiency_last10cycle: number
  freespace: number
  reliability_points: number
}

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
  uniqueBorrowers: Array<string>
  xtzDelegatedTo?: string
  operators?: Array<string>
  sMVKDelegatedTo?: string
  depositors?: Array<string>
}

export type UserLendObjType = {
  assetIcon: string
  assetName: string
  amount: number
  id: number
  apy: number
  earned: number
  mvkBonus: number
}

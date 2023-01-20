import { ChartPlotType } from 'app/App.components/Chart/Chart.view'
import { normalizeLoans } from 'pages/Loans/Loans.helpers'
import { Lending_Controller } from 'utils/generated/graphqlTypes'

export type LoansGQL = Omit<Lending_Controller, '__typename'>
export type LoansStorage = Awaited<ReturnType<typeof normalizeLoans>>

export type LoanTokenType = {
  loanTokenData: {
    name: string
    symbol?: string
    decimals: number
    icon?: string
    rate: number
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
  lending24hVolume: number
  borrowing24hVolume: number
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
    apr: number
    fee: number
  }
  collateralData: Array<{
    assetSymbol?: string
    assetIcon?: string
    balance: number
    assetRate: number | null
    maxWithdraw: number
    collateralShare?: number
  }>
  address: string
  xtzDelegatedTo: string | null
  operators?: Array<string>
  sMVKDelegatedTo?: string
  depositors?: Array<string>
}

export type UserLendObjType = {
  assetIcon: string
  assetName: string
  amount: number
  id: number
  annualPecentage: number
  earned: number
  operationHash: string
}

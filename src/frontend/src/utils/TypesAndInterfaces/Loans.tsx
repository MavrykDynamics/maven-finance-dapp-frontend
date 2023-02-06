import { ChartPlotType } from 'app/App.components/Chart/Chart.view'
import { normalizeLoans } from 'pages/Loans/Loans.helpers'
import { Lending_Controller } from 'utils/generated/graphqlTypes'

export type LoansGQL = Omit<Lending_Controller, '__typename'>
export type LoansStorage = Awaited<ReturnType<typeof normalizeLoans>>

export type LoanTokenType = 'tez' | 'fa12' | 'fa2'

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
  userBalance: number
  tokenType: LoanTokenType
}

export type CollateralType = BaseLoansAssetDataType & {
  amount: number
  collateralShare?: number
}

export type LoansChartsDataType = {
  totalBorrowed: number
  borrowingChartData: Array<ChartPlotType>
  totalLended: number
  lendingChartData: Array<ChartPlotType>
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
  id: number
  annualPecentage: number
  earned: number
  operationHash: string
}

export type LoansVaultType = {
  borrowedAsset: LoansAssetDataType
  collateralData: Array<CollateralType>
  borrowedAmount: number
  collateralBalance: number
  collateralRatio: number
  borrowCapacity: number
  apr: number
  fee: number
  repayFee: number
  address: string
  vaultId: number
  xtzDelegatedTo: string | null
  operators?: Array<string>
  sMVKDelegatedTo?: string
  levelOfEarly?: number
  levelOfLate?: number
  depositors?: Array<string>
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
  myBorrowingList: Array<LoansVaultType>
  permissionedBorrowingList: Array<LoansVaultType>
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

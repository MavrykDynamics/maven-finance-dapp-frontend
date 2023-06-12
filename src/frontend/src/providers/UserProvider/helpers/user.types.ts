import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'

// Use User Loans Data Types
export type UserLendBorrowItem = {
  amount: number
  id: number
  annualPecentage: number
  date: string
  operationHash: string
  tokenAddress: TokenAddressType
}

export type UserLoansDataStateType = {
  userBorrowings: Array<UserLendBorrowItem>
  totalUserBorrowed: number
  totalUserLended: number
  userLendings: Array<UserLendBorrowItem>
  userVaultsData: Record<string, { borrowedAmount: number; collateralAmount: number }>
}

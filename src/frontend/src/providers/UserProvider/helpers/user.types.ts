import { z } from 'zod'

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

// user tokens Types
export const userTokenBalanceSchema = z.array(
  z.object({
    token: z.object({
      contract: z.object({
        address: z.string(),
      }),
    }),
    balance: z.string(),
  }),
)
export type UserTokenBalancesParsedResponce = z.infer<typeof userTokenBalanceSchema>

export const userTzktAccountSchema = z.object({
  balance: z.number(),
})
export type UserTzktAccountParsedResponce = z.infer<typeof userTokenBalanceSchema>

export const userTzktWSAccountSchema = z.array(userTzktAccountSchema)
export type UserTzktWSAccountParsedResponce = z.infer<typeof userTzktWSAccountSchema>

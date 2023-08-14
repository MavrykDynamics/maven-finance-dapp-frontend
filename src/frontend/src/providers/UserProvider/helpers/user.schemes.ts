import { z } from 'zod'

export const userTzktTokenBalancesSchema = z.array(
  z.object({
    token: z.object({
      contract: z.object({
        address: z.string(),
      }),
    }),
    account: z.object({
      address: z.string(),
    }),
    balance: z.string(),
  }),
)

export const userTzktAccountSchema = z.object({
  balance: z.number(),
  address: z.string(),
})

export const emptyUserTzktAccountSchema = z.object({
  type: z.literal('empty'),
  address: z.string(),
})

export const userTzktWSAccountSchema = z.array(userTzktAccountSchema)

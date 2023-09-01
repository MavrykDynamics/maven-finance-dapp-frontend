import { z } from 'zod'

export const tokenGqlSchema = z.object({
  token_id: z.number(),
  metadata: z.any(),
  token_address: z.string(),
  token_standard: z.string().or(z.null()),

  lending_controller_collateral_tokens: z
    .tuple([
      z.object({
        token_name: z.string(),
        paused: z.boolean(),
        is_scaled_token: z.boolean(),
        is_staked_token: z.boolean(),
      }),
    ])
    .or(z.tuple([])),

  lending_controller_loan_tokens: z
    .tuple([
      z.object({
        loan_token_name: z.string(),
        min_repayment_amount: z.number(),
      }),
    ])
    .or(z.tuple([])),

  m_tokens: z
    .tuple([
      z.object({
        address: z.string(),
      }),
    ])
    .or(z.tuple([])),

  mvk_tokens: z
    .tuple([
      z.object({
        address: z.string(),
      }),
    ])
    .or(z.tuple([])),
})

export const tokensGqlSchema = z.array(tokenGqlSchema)

export type TokensGqlSchemaType = z.infer<typeof tokensGqlSchema>

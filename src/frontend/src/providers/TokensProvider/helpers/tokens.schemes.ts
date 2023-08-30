import { z } from 'zod'

// full token schema
export const tokenGqlSchema = z.object({
  token_id: z.number(),
  metadata: z.any(),
  token_address: z.string(),
  token_standard: z.string(),

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

  farms_lp_tokens: z
    .tuple([
      z.object({
        name: z.string(),
        metadata: z.any(),
        token0: z
          .object({
            token_address: z.string(),
            metadata: z.any(),
          })
          .or(z.null()),
        token1: z
          .object({
            token_address: z.string(),
            metadata: z.any(),
          })
          .or(z.null()),
      }),
    ])
    .or(z.tuple([])),
})
export const tokensGqlSchema = z.array(tokenGqlSchema)
export type TokensGqlSchemaType = z.infer<typeof tokensGqlSchema>

// token collection metadata schema type
export const tokenMetadataSchema = z.object({
  icon: z.string().optional(),
  symbol: z.string(),
  decimals: z.string(),
})
export type TokenIndexerMetadataType = z.infer<typeof tokenMetadataSchema>

// user mToken schema
export const mTokenMetadataSchema = z.object({
  assets: z.array(
    z.object({
      decimals: z.string(),
    }),
  ),
})

// farm tokens schema
export const farmLiquidityPairTokenMetadataSchema = z.object({
  liquidityPairToken: z.object({
    symbol: z.tuple([z.string()]),
    tokenAddress: z.tuple([z.string()]),
  }),
})

export const farmLiquidityTokenMetadataSchema = z.object({
  liquidityToken: z.object({
    symbol: z.tuple([z.string()]),
    tokenAddress: z.tuple([z.string()]),
  }),
})

export const farmLpSubtokenMetadataSchema = z.object({
  icon: z.string().optional(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.string(),
})

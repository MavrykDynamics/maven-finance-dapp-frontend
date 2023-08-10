import { z } from 'zod'

export const smallFeedSchema = z.object({
  address: z.string(),
  last_completed_data_last_updated_at: z.string(),
  last_completed_data: z.number(),
  last_completed_data_pct_oracle_resp: z.number(),
})

export const smallFeedsQuerySchema = z.array(smallFeedSchema)

export type SmallFeedsQueryType = z.infer<typeof smallFeedsQuerySchema>

export const fullFeedSchema = z.object({
  address: z.string(),
  name: z.string(),
  admin: z.string(),
  decimals: z.number(),
  network: z.string(),
  metadata: z.any(),

  creation_timestamp: z.string(),
  last_completed_data: z.number(),
  last_completed_data_last_updated_at: z.string(),
  last_completed_data_pct_oracle_resp: z.number(),

  heart_beat_seconds: z.number(),
  reward_amount_xtz: z.number(),
  reward_amount_smvk: z.number(),
  pct_oracle_threshold: z.number(),
  alpha_pct_per_thousand: z.number(),

  oracles_aggregate: z.object({
    aggregate: z.object({
      count: z.number(),
    }),
  }),
})

export const fullFeedsQuerySchema = z.array(fullFeedSchema)

export type FullFeedsQueryType = z.infer<typeof fullFeedsQuerySchema>

export const feedMetadataSchema = z.object({
  icon: z.string(),
  category: z.string(),
})

export type TokenPricesFeedsType = {
  name: string
  last_completed_data: number
  decimals: number
}[]

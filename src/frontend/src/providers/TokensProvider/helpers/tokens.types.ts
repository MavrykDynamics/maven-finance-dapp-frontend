import { SubscriptionSkipType } from 'utils/api/apollo.consts'
import { z } from 'zod'

export type TokensSubscriptionSkipsType = {
  skipTokensMetadataSubscription?: SubscriptionSkipType
}

export const tokenMetadataSchema = z.object({
  icon: z.string().optional(),
  symbol: z.string(),
  decimals: z.string(),
})

export const mTokenMetadataSchema = z.object({
  decimals: z.string(),
})

import { z } from 'zod'

export const vaultBlockSchema = z.object({
  cycle: z.number(),
  level: z.number(),
  hash: z.string(),
  timestamp: z.string(),
  proto: z.number(),
  payloadRound: z.number(),
  blockRound: z.number(),
  validations: z.number(),
  deposit: z.number(),
  reward: z.number(),
  bonus: z.number(),
  fees: z.number(),
  nonceRevealed: z.boolean(),
  proposer: z.object({
    address: z.string(),
  }),
  producer: z.object({
    address: z.string(),
  }),
  software: z.object({
    version: z.string().optional(),
    date: z.string(),
  }),
  lbToggle: z.boolean().optional(),
  lbToggleEma: z.number(),
  priority: z.number(),
  baker: z.object({
    address: z.string(),
  }),
  lbEscapeVote: z.boolean(),
  lbEscapeEma: z.number(),
})

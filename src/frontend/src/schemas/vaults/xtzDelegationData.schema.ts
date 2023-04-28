import { z } from 'zod'

export const xtzDelegationDataSchema = z.object({
  id: z.number(),
  type: z.string(),
  address: z.string(),
  kind: z.string(),
  balance: z.number(),
  creator: z.object({
    address: z.string(),
  }),
  delegate: z.object({
    address: z.string()
  }).optional(),
  numContracts: z.number(),
  activeTokensCount: z.number(),
  tokensCount: z.number(),
  tokenBalancesCount: z.number(),
  tokenTransfersCount: z.number(),
  numDelegations: z.number(),
  numOriginations: z.number(),
  numTransactions: z.number(),
  numReveals: z.number(),
  numMigrations: z.number(),
  transferTicketCount: z.number(),
  increasePaidStorageCount: z.number(),
  eventsCount: z.number(),
  firstActivity: z.number(),
  firstActivityTime: z.string(),
  lastActivity: z.number(),
  lastActivityTime: z.string(),
  typeHash: z.number(),
  codeHash: z.number(),
})

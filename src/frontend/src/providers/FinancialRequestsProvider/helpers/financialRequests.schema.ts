import { z } from 'zod'

// TODO check typed after votes indexer fix
export const finRequestVote = z.object({
  governanceFinRequestId: z.number(),
  id: z.number(),
  timestamp: z.string(),
  vote: z.any(),
  voter: z.string(),
})

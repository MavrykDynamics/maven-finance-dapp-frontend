import { z } from 'zod'

export const finRequestVote = z.object({
  governanceFinRequestId: z.number(),
  id: z.number(),
  timestamp: z.string(),
  vote: z.number(),
  voter: z.string(),
})

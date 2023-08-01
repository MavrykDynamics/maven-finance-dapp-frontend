import { z } from 'zod'
import { finRequestVote } from './financialRequests.schema'

// Financical request types
export type FinancialRequestRecord = {
  tokenAddress: string
  id: number
  type: string
  purpose: string
  requesterAddress: string
  requestedTime?: string | null
  governanceContract: string
  governanceFinId: string
  treasuryContract: string
  votingTillTime?: string | null
  tokensAmount: number
  status: number
  executed: boolean

  // Votes data
  votes: FinRequestVoteType[]
  forVotesMVKTotal: number
  againstVotesMVKTotal: number
  sMVKTotakSupply: number
  quorum: number
}

export type FinRequestVoteType = z.infer<typeof finRequestVote>

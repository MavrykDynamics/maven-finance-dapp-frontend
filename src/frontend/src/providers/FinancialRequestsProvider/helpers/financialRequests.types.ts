import {z} from 'zod'
import {finRequestVote} from './financialRequests.schema'

// Financial request types
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
  droppedTime?: string | null
  tokensAmount: number
  status: number
  executed: boolean

  // Votes data
  votes: FinRequestVoteType[]
  yayVotesMvnTotal: number
  nayVotesMvnTotal: number
  sMVNTotalSupply: number
  quorum: number
}

export type FinRequestVoteType = z.infer<typeof finRequestVote>

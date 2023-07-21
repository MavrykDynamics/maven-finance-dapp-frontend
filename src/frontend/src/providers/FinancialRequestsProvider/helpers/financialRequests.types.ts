import { GetFinRequestsStorageSubscription } from 'utils/__generated__/graphql'

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
  votes: GetFinRequestsStorageSubscription['governance_financial_request'][0]['votes']
  forVotesMVKTotal: number
  againstVotesMVKTotal: number
  sMVKTotakSupply: number
  quorum: number
}

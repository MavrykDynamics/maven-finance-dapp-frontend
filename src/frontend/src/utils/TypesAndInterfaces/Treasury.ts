import { normalizeTreasuryStorage } from 'pages/Treasury/Treasury.normalizer'
import type { Treasury } from '../generated/graphqlTypes'
export type TreasuryGraphQL = Omit<Treasury, '__typename'>

export type TreasuryType = ReturnType<typeof normalizeTreasuryStorage>

export type TreasuryBalanceType = {
  balance: number
  contract: string
  chartColor: string
  tokenAddress: string
}

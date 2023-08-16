import { GetTreasuryStorageDataQuery, GetTreasuryUserBalancesQuery, Treasury } from 'utils/__generated__/graphql'
import { normalizeTreasuryStorage } from './treasury.normalizer'
export type TreasuryGraphQL = Omit<Treasury, '__typename'>

export type TreasuryType = ReturnType<typeof normalizeTreasuryStorage>

export type TreaurtGQLData = GetTreasuryStorageDataQuery & GetTreasuryUserBalancesQuery

export type TreasuryBalanceType = {
  balance: number
  contract: string
  chartColor: string
  tokenAddress: string
}

export type TreasuryData = {
  address: string
  name: string
  balances: TreasuryBalanceType[]
}

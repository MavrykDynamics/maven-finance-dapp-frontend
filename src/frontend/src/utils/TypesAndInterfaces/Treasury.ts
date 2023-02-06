// type
import type { Treasury, Treasury_Factory } from '../generated/graphqlTypes'
export type TreasuryGraphQL = Omit<Treasury, '__typename'>
export type TreasuryFactoryGraphQL = Omit<Treasury_Factory, '__typename'>

export type TreasuryGQLType = {
  address: string
  name: string
}

export type TreasuryType = TreasuryGQLType & FetchedTreasuryType & { treasuryTVL: number }

export type FetchedTreasuryType = {
  balances: Array<TreasuryBalanceType>
  total?: number
}

export type FetchedTreasuryBalanceType = {
  account: { address: string }
  balance: string
  token: {
    metadata: { symbol: string; name: string; decimals: string; thumbnailUri?: string }
  }
}

export type TreasuryBalanceType = {
  rate: number | null
  balance: number
  contract?: string
  decimals: number
  name: string
  symbol: string
  thumbnail_uri?: string
  usdValue: number
  chartColor: string
}

export type TreasuryChartType = Array<ChartSectorType>

export type ChartSectorType = {
  title: string
  value: number
  color: string
  labelPersent: number
  segmentStroke: number
  isHoveredPathAsset: boolean
  groupedSmall: boolean
}

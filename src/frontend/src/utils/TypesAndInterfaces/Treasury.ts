import { normalizeTreasuryStorage } from 'pages/Treasury/Treasury.helpers'
import type { Treasury, Treasury_Factory } from '../generated/graphqlTypes'
export type TreasuryGraphQL = Omit<Treasury, '__typename'>
export type TreasuryFactoryGraphQL = Omit<Treasury_Factory, '__typename'>

export type TreasuryType = ReturnType<typeof normalizeTreasuryStorage>

export type TreasuryBalanceType = {
  rate: number | null
  balance: number
  contract: string
  decimals: number
  name: string
  symbol: string
  icon: string
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

export type TreasuryAssetMapperType = {
  icon: string
  name: string
  symbol: string
  decimals: string
}

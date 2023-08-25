import { ChartPeriodType } from 'types/charts.type'
import {
  normalizeFeeds,
  normalizeFeed,
  normalizeDataFeedsHistory,
  normalizeDataFeedsVolatility,
} from './helpers/feedsNormalizer'
import { FeedHistoryQeuryQuery } from 'utils/__generated__/graphql'

export type DataFeedsStorageType = ReturnType<typeof normalizeFeeds>
export type Feed = NonNullable<ReturnType<typeof normalizeFeed>>
export type DataFeedsHistoryType = ReturnType<typeof normalizeDataFeedsHistory>
export type DataFeedsVolatilityType = ReturnType<typeof normalizeDataFeedsVolatility>

// nullable history default state types
export type NullableDataFeedsHistoryChartsType = TupleKeyValueAny<ChartPeriodType, DataFeedsHistoryType | null>
export type NullableDataFeedsVolatilityChartsType = TupleKeyValueAny<ChartPeriodType, DataFeedsVolatilityType | null>

export type DataFeedsContextStateType = {
  feedsMapper: DataFeedsStorageType['feedsMapper']
  feedsAddresses: DataFeedsStorageType['feedsAddresses']
  feedsCategories: DataFeedsStorageType['feedsCategories']
  dataFeedsHistory: NullableDataFeedsHistoryChartsType
  dataFeedsVolatility: NullableDataFeedsVolatilityChartsType
}

export type NullableDataFeedsContextStateType = DeepNullable<
  Omit<DataFeedsContextStateType, 'dataFeedsHistory' | 'dataFeedsVolatility'>
> & {
  dataFeedsHistory: NullableDataFeedsHistoryChartsType
  dataFeedsVolatility: NullableDataFeedsVolatilityChartsType
}

export type DataFeedsContext = DataFeedsContextStateType & {
  isLoading: boolean

  updateFeedsHistoryAndVolatility: (
    data: FeedHistoryQeuryQuery['aggregator'][number]['history_data'],
    period: ChartPeriodType,
  ) => void
  resetFeedsHistoryAndVolatility: () => void
}

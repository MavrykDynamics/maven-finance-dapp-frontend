import { ChartPeriodType } from 'types/charts.type'
import { normalizeFeeds, normalizeFeed, normalizeDataFeedsHistory } from './helpers/feedsNormalizer'
import { FeedHistoryQeuryQuery } from 'utils/__generated__/graphql'
import { REGISTER_FEED_ACTION } from './helpers/feeds.consts'

export type FeedsActionsType = typeof REGISTER_FEED_ACTION

export type DataFeedsStorageType = ReturnType<typeof normalizeFeeds>
export type Feed = NonNullable<ReturnType<typeof normalizeFeed>>
export type DataFeedsHistoryType = ReturnType<typeof normalizeDataFeedsHistory>

// nullable history default state types
export type NullableDataFeedsHistoryChartsType = TupleKeyValueAny<
  ChartPeriodType,
  DataFeedsHistoryType['dataFeedsHistory'] | null
>
export type NullableDataFeedsVolatilityChartsType = TupleKeyValueAny<
  ChartPeriodType,
  DataFeedsHistoryType['dataFeedsVolatility'] | null
>

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

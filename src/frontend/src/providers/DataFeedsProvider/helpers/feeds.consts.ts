import { ALL_TIME, ONE_HOUR, ONE_MONTH, ONE_WEEK, TWENTY_FOUR_HOURS } from 'consts/charts.const'
import { DataFeedsContextStateType, NullableDataFeedsContextStateType } from '../dataFeeds.provider.types'

// Feed actions
export const REGISTER_FEED_ACTION = 'REGISTER_FEED_ACTION'

// PROVIDER DEFAULT CONSTS
export const DEFAULT_DATA_FEEDS_HISTORY = {
  [ONE_HOUR]: null,
  [TWENTY_FOUR_HOURS]: null,
  [ONE_WEEK]: null,
  [ONE_MONTH]: null,
  [ALL_TIME]: null,
}

export const DFEFAULT_DATA_FEEDS_VOLATILITY = DEFAULT_DATA_FEEDS_HISTORY

export const DEFAULT_DATA_FEEDS_CTX: NullableDataFeedsContextStateType = {
  feedsMapper: null,
  feedsAddresses: null,
  feedsCategories: null,
  dataFeedsHistory: DEFAULT_DATA_FEEDS_HISTORY,
  dataFeedsVolatility: DFEFAULT_DATA_FEEDS_VOLATILITY,
}
export const EMPTY_DATA_FEEDS_CTX: DataFeedsContextStateType = {
  feedsMapper: {},
  feedsAddresses: [],
  feedsCategories: [],
  dataFeedsHistory: DEFAULT_DATA_FEEDS_HISTORY,
  dataFeedsVolatility: DFEFAULT_DATA_FEEDS_VOLATILITY,
}

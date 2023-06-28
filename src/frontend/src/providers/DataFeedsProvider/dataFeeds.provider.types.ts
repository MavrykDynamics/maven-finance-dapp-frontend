import { normalizeFeeds, normalizeFeed } from './helpers/feedsNormalizer'

export type DataFeedsStorageType = ReturnType<typeof normalizeFeeds>
export type Feed = ReturnType<typeof normalizeFeed>

export type DataFeedsContext = {
  feedsMapper: DataFeedsStorageType['feedsMapper']
  feedsAddresses: DataFeedsStorageType['feedsAddresses']
  feedsCategories: DataFeedsStorageType['feedsCategories']
  isLoading: boolean
}

export type DataFeedsContextState = Pick<DataFeedsContext, 'feedsAddresses' | 'feedsCategories' | 'feedsMapper'>

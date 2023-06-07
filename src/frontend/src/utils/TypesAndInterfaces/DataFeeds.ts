import { normalizeFeed, normalizeFeeds } from 'pages/DataFeeds/DataFeeds.helpers'
import { Aggregator } from 'utils/generated/graphqlTypes'

// metadata has unknown type
type FeedMetadataType = { metadata?: { category?: string; icon: string }; network?: string } | undefined

export type DataFeedsStorageType = ReturnType<typeof normalizeFeeds>

export type FeedGqlType = Aggregator & FeedMetadataType
export type Feed = ReturnType<typeof normalizeFeed>

export type FeedHistoryData = Pick<Aggregator, 'history_data'>['history_data']

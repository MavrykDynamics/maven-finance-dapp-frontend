import { DAPPConfigContext } from 'providers/DAPPConfig/dappConfig.types'
import DataFeedsProvider from './dataFeeds.provider'

import { normalizeFeeds, normalizeFeed } from './helpers/feedsNormalizer'

export type DataFeedsStorageType = ReturnType<typeof normalizeFeeds>
export type Feed = ReturnType<typeof normalizeFeed>

export type DataFeedsContext = {
  // data
  feedsMapper: DataFeedsStorageType['feedsMapper']
  feedsAddresses: DataFeedsStorageType['feedsAddresses']
  feedsCategories: DataFeedsStorageType['feedsCategories']
  // actions
  updateDataFeeds: InstanceType<typeof DataFeedsProvider>['updateDataFeeds']
  registerFeedAction: InstanceType<typeof DataFeedsProvider>['registerFeedAction']
}

export type State = {
  context: DataFeedsContext
}

export type Props = {
  children: React.ReactNode
}

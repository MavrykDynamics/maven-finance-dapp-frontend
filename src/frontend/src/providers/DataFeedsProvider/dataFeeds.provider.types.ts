import DataFeedsProvider from './dataFeeds.provider'

import { DataFeedsStorageType } from 'utils/TypesAndInterfaces/DataFeeds'

export type DataFeedsContext = DataFeedsStorageType & {
  isLoaded: boolean
  // actions
  initializeDataFeeds: InstanceType<typeof DataFeedsProvider>['initializeDataFeeds']
  registerFeedAction: InstanceType<typeof DataFeedsProvider>['registerFeedAction']
}

export type State = {
  context: DataFeedsContext
}

export type Props = {
  children: React.ReactNode
}

import { ChartPlotType } from 'app/App.components/Chart/Chart.view'
import { normalizeFeeds } from 'pages/DataFeeds/DataFeeds.helpers'
import { Aggregator, Aggregator_History_Data } from 'utils/generated/graphqlTypes'

export type DataFeedsStorageType = ReturnType<typeof normalizeFeeds>

export type FeedGQL = Omit<Aggregator, '__typename' | 'history_data'> & {
  category: string | null
  network: string | null
}

export type Feed = FeedGQL & {
  dataFeedsHistory: Array<ChartPlotType>
  dataFeedsVolatility: Array<ChartPlotType>
  amount: number
  icon?: string
}

export type DataFeedsHistoryGraphQL = Omit<Aggregator_History_Data, '__typename'>

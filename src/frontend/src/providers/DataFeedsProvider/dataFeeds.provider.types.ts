import { normalizeFeeds, normalizeFeed } from './helpers/feedsNormalizer'
import { AreaChartPlotType } from 'app/App.components/Chart/helpers/Chart.types'

export type DataFeedsStorageType = ReturnType<typeof normalizeFeeds>
export type Feed = NonNullable<ReturnType<typeof normalizeFeed>>

export type DataFeedsContext = {
  feedsMapper: DataFeedsStorageType['feedsMapper']
  feedsAddresses: DataFeedsStorageType['feedsAddresses']
  feedsCategories: DataFeedsStorageType['feedsCategories']
  feedsCharts: Record<
    string,
    {
      data: Array<AreaChartPlotType>
      // TODO: add period consts and place them in common consts
      period: string
    }
  >

  isLoading: boolean
  setFeedChart: (newChartData: Array<AreaChartPlotType>, feedAddress: string, period: string) => void
}

export type DataFeedsContextState = Pick<
  DataFeedsContext,
  'feedsAddresses' | 'feedsCategories' | 'feedsMapper' | 'feedsCharts'
>

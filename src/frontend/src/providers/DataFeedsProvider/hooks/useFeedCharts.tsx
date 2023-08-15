import { useEffect, useState } from 'react'

import { FEED_HISTORY_QUERY } from '../queries/feeds.query'
import { normalizeDataFeedsHistory, normalizeDataFeedsVolatility } from '../helpers/feedsNormalizer'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { useDataFeedsContext } from '../dataFeeds.provider'
import { AreaChartPlotType } from 'app/App.components/Chart/helpers/Chart.types'

// TODO: after dev-demo store all data in ctx to show feed chart user was on immidiately
export const useFeedCharts = (feedAddress: string) => {
  // const { feedsCharts, setFeedChart } = useDataFeedsContext()

  const [feedChartData, setFeedChartData] = useState<{
    dataFeedsHistory: null | Array<AreaChartPlotType>
    dataFeedsVolatility: null | Array<AreaChartPlotType>
  }>({
    dataFeedsHistory: null,
    dataFeedsVolatility: null,
  })

  useEffect(() => {
    return () => {
      setFeedChartData({
        dataFeedsHistory: null,
        dataFeedsVolatility: null,
      })
    }
  }, [feedAddress])

  useQueryWithRefetch(FEED_HISTORY_QUERY, {
    variables: {
      feedAddress,
    },
    fetchPolicy: 'no-cache',
    onCompleted: (data) => {
      const feedsHistory = data.aggregator[0].history_data

      setFeedChartData({
        dataFeedsHistory: normalizeDataFeedsHistory(feedsHistory),
        dataFeedsVolatility: normalizeDataFeedsVolatility(feedsHistory),
      })
    },
    onError: (e) => console.error('loading feed chart error:', { feedAddress, e }),
  })

  return {
    isLoading: feedChartData.dataFeedsVolatility === null || feedChartData.dataFeedsHistory === null,
    dataFeedsHistory: feedChartData.dataFeedsHistory,
    dataFeedsVolatility: feedChartData.dataFeedsVolatility,
  }
}

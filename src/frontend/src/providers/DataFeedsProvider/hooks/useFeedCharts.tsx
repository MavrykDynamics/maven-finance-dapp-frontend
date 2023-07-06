import { useEffect, useMemo, useState } from 'react'
import { useSubscription } from '@apollo/client'

import { FeedChartsSubsSkipsType } from '../helpers/feeds.types'
import { SUB_QUERY, SUB_SKIP, SUB_SUBSCRIBE } from 'utils/api/apollo.consts'
import { SUBSCRIBE_FEED_HISTORY } from '../queries/feeds.query'
import { normalizeDataFeedsHistory, normalizeDataFeedsVolatility } from '../helpers/feedsNormalizer'

export const useFeedCharts = (
  { skipFeedChartsSubsciption }: FeedChartsSubsSkipsType = {
    skipFeedChartsSubsciption: SUB_SUBSCRIBE,
  },
  feedAddress?: string,
) => {
  const [shouldSkip, setShouldSkip] = useState<FeedChartsSubsSkipsType>({
    skipFeedChartsSubsciption,
  })

  const { loading: feedsHistoryLoading, data: feedsHistory } = useSubscription(SUBSCRIBE_FEED_HISTORY, {
    variables: {
      feedAddress,
    },
    skip: shouldSkip.skipFeedChartsSubsciption === SUB_SKIP || !feedAddress,
  })

  // Effect to load data 1 time and then skip loading, cuz loading returned from useSubscription is only for initial loading
  useEffect(() => {
    if (!feedsHistoryLoading && skipFeedChartsSubsciption === SUB_QUERY) {
      setShouldSkip((prevSkip) => ({
        ...prevSkip,
        skipFeedChartsSubsciption: SUB_SKIP,
      }))
    }
  }, [skipFeedChartsSubsciption, feedsHistoryLoading])

  const { dataFeedsHistory, dataFeedsVolatility } = useMemo(() => {
    if (!feedsHistory || !feedsHistory.aggregator[0]) return { dataFeedsHistory: [], dataFeedsVolatility: [] }

    return {
      dataFeedsHistory: normalizeDataFeedsHistory(feedsHistory.aggregator[0].history_data),
      dataFeedsVolatility: normalizeDataFeedsVolatility(feedsHistory.aggregator[0].history_data),
    }
  }, [feedsHistory])

  return {
    isLoading: feedsHistoryLoading,
    dataFeedsHistory,
    dataFeedsVolatility,
  }
}

import { useCallback, useEffect, useRef, useState } from 'react'

// hooks
import { useGraphQLQuery } from 'providers/QueryProvider/useGraphQLQuery'
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { useDataFeedsContext } from '../dataFeeds.provider'

// consts
import { FEED_HISTORY_QUERY } from '../queries/feeds.query'
import { ONE_HOUR } from 'consts/charts.const'

// types
import { ChartPeriodType } from 'types/charts.type'

// utils
import { getTimestampBasedOnPeriod } from 'utils/charts.utils'

export const useFeedCharts = (feedAddress: string, period: ChartPeriodType = ONE_HOUR) => {
  const { updateFeedsHistoryAndVolatility, dataFeedsHistory, dataFeedsVolatility, resetFeedsHistoryAndVolatility } =
    useDataFeedsContext()
  const { handleQueryError } = useQueryProvider()

  const [currentPeriod, setCurrentPeriod] = useState(() => getTimestampBasedOnPeriod(period))
  const aborterRef = useRef(new AbortController())

  const refetchQueryVariables = useCallback(() => {
    return {
      feedAddress,
      periodTimestamp: getTimestampBasedOnPeriod(period),
    }
  }, [feedAddress, period])

  useEffect(() => {
    setCurrentPeriod(getTimestampBasedOnPeriod(period))

    // cancel query
    return () => {
      aborterRef.current.abort()
      aborterRef.current = new AbortController()
    }
  }, [period])

  useEffect(() => {
    resetFeedsHistoryAndVolatility()
  }, [feedAddress])

  useGraphQLQuery(
    FEED_HISTORY_QUERY,
    {
      variables: {
        feedAddress,
        periodTimestamp: currentPeriod,
      },
      onCompleted: (data) => {
        const feedsHistory = data.aggregator[0].history_data

        updateFeedsHistoryAndVolatility(feedsHistory, period)
      },
      onError: (error) => handleQueryError(error, 'FEED_HISTORY_QUERY'),
    },
    {
      refetchQueryVariables,
    },
  )

  return {
    isLoading: dataFeedsHistory[period] === null || dataFeedsVolatility[period] === null,
    dataFeedsHistory: dataFeedsHistory[period],
    dataFeedsVolatility: dataFeedsVolatility[period],
  }
}

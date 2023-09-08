import { useCallback, useEffect, useRef, useState } from 'react'

// hooks
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
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
  const { handleApolloError } = useApolloContext()

  const [currentPeriod, setCurrentPeriod] = useState(() => getTimestampBasedOnPeriod(period))
  const aborterRef = useRef(new AbortController())

  const refetchQueryVariables = useCallback(() => {
    return {
      periodTimestamp: getTimestampBasedOnPeriod(period),
    }
  }, [period])

  useEffect(() => {
    setCurrentPeriod(getTimestampBasedOnPeriod(period))

    return () => {
      // cancel query
      aborterRef.current.abort()
      aborterRef.current = new AbortController()
    }
  }, [period])

  useEffect(() => {
    resetFeedsHistoryAndVolatility()
  }, [feedAddress])

  useQueryWithRefetch(
    FEED_HISTORY_QUERY,
    {
      variables: {
        feedAddress,
        periodTimestamp: currentPeriod,
      },
      fetchPolicy: 'network-only',
      context: {
        fetchOptions: {
          signal: aborterRef.current.signal,
        },
      },
      onCompleted: (data) => {
        if (!data) return
        const feedsHistory = data.aggregator[0].history_data

        updateFeedsHistoryAndVolatility(feedsHistory, period)
      },
      onError: (error) => handleApolloError(error, 'FEED_HISTORY_QUERY'),
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

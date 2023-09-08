import { useCallback, useEffect, useRef, useState } from 'react'
import { ApolloError } from '@apollo/client'

// queries
import { FEED_HISTORY_QUERY } from '../queries/feeds.query'

// hooks
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { useDataFeedsContext } from '../dataFeeds.provider'

// providers
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// consts
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { ONE_HOUR } from 'consts/charts.const'

// types
import { ChartPeriodType } from 'types/charts.type'

// utils
import { getTimestampBasedOnPeriod } from 'utils/charts.utils'
import { isAbortError } from 'errors/error'

export const useFeedCharts = (feedAddress: string, period: ChartPeriodType = ONE_HOUR) => {
  const { updateFeedsHistoryAndVolatility, dataFeedsHistory, dataFeedsVolatility, resetFeedsHistoryAndVolatility } =
    useDataFeedsContext()
  const { bug } = useToasterContext()

  const [currentPeriod, setCurrentPeriod] = useState(() => getTimestampBasedOnPeriod(period))
  const aborterRef = useRef(new AbortController())

  const refetchQueryVariables = useCallback(() => {
    return {
      periodTimestamp: getTimestampBasedOnPeriod(period),
    }
  }, [period])

  const handleSubError = (error: ApolloError, subName: string) => {
    if (isAbortError(error.networkError)) return
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  useEffect(() => {
    setCurrentPeriod(getTimestampBasedOnPeriod(period))

    return () => {
      // cancel queries
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
      onError: (error) => handleSubError(error, 'Feeds history query error'),
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

import { useCallback, useEffect, useRef, useState } from 'react'

import { FEED_HISTORY_QUERY } from '../queries/feeds.query'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { ApolloError } from '@apollo/client'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { FEED_HISTORY_SUB } from '../helpers/feeds.consts'
import { ChartPeriodType } from 'types/charts.type'
import { ONE_HOUR } from 'consts/charts.const'
import { getTimestampBasedOnPeriod } from 'utils/charts.utils'
import { useDataFeedsContext } from '../dataFeeds.provider'

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
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  useEffect(() => {
    setCurrentPeriod(getTimestampBasedOnPeriod(period))

    // cancel queries
    aborterRef.current.abort()
    aborterRef.current = new AbortController()
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
      onError: (error) => handleSubError(error, FEED_HISTORY_SUB),
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

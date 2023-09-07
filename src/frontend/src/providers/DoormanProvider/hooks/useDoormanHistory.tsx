import { ApolloError } from '@apollo/client'
import { useCallback, useEffect, useRef, useState } from 'react'

// types
import { ChartPeriodType } from 'types/charts.type'

// hooks
import { useDoormanContext } from '../doorman.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// consts
import { SMVK_MVK_HISTORY_DATA } from '../queries/doorman.query'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { ONE_HOUR } from 'consts/charts.const'

// utils
import { getTimestampBasedOnPeriod } from 'utils/charts.utils'

// getTimestampBasedOnPeriod
export const useDoormanHistory = (period: ChartPeriodType = ONE_HOUR) => {
  const { updateStakeHistoryData, mvkHistoryData, smvkHistoryData, noChartData } = useDoormanContext()
  const { bug } = useToasterContext()

  const handleSubError = (error: ApolloError, subName: string) => {
    console.error(`${subName} query error: `, error)
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

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
      // cancel queries
      aborterRef.current.abort()
      aborterRef.current = new AbortController()
    }
  }, [period])

  useQueryWithRefetch(
    SMVK_MVK_HISTORY_DATA,
    {
      onCompleted: (data) => {
        if (!data) return
        updateStakeHistoryData(data, period)
      },
      fetchPolicy: 'network-only',
      context: {
        fetchOptions: {
          signal: aborterRef.current.signal,
        },
      },
      variables: {
        periodTimestamp: currentPeriod,
      },
      onError: (error) => handleSubError(error, 'SMVK_MVK_HISTORY_DATA'),
    },
    { refetchQueryVariables },
  )

  return {
    isLoading: mvkHistoryData[period] === null || smvkHistoryData[period] === null,
    noChartData,
    mvkHistoryData: mvkHistoryData[period] ?? [],
    smvkHistoryData: smvkHistoryData[period] ?? [],
  }
}

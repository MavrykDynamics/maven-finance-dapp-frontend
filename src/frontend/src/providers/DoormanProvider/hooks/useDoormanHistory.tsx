import { useCallback, useEffect, useRef, useState } from 'react'

// types
import { ChartPeriodType } from 'types/charts.type'

// providers
import { useDoormanContext } from '../doorman.provider'

// hooks
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// queries
import { SMVK_MVK_HISTORY_DATA } from '../queries/doorman.query'

// consts
import { MVK_SMVK_HISTORY_SUB } from '../helpers/doorman.consts'
import { ONE_HOUR } from 'consts/charts.const'

// utils
import { getTimestampBasedOnPeriod } from 'utils/charts.utils'

// getTimestampBasedOnPeriod
export const useDoormanHistory = (period: ChartPeriodType = ONE_HOUR) => {
  const { updateStakeHistoryData, handleSubError, mvkHistoryData, smvkHistoryData, noChartData } = useDoormanContext()

  const [currentPeriod, setCurrentPeriod] = useState(() => getTimestampBasedOnPeriod(period))
  const aborterRef = useRef(new AbortController())

  const refetchQueryVariables = useCallback(() => {
    return {
      periodTimestamp: getTimestampBasedOnPeriod(period),
    }
  }, [period])

  useEffect(() => {
    setCurrentPeriod(getTimestampBasedOnPeriod(period))

    // cancel queries
    aborterRef.current.abort()
    aborterRef.current = new AbortController()
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
      onError: (error) => handleSubError(error, MVK_SMVK_HISTORY_SUB),
    },
    { refetchQueryVariables },
  )

  const isLoading = mvkHistoryData[period] === null || smvkHistoryData[period] === null

  return {
    isLoading, // for empty array
    noChartData,
    mvkHistoryData: mvkHistoryData[period] ?? [],
    smvkHistoryData: smvkHistoryData[period] ?? [],
  }
}

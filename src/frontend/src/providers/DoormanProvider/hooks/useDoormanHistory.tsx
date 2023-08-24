import { useCallback, useEffect, useRef } from 'react'

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
  const { updateStakeHistoryData, handleSubError, mvkHistoryData, smvkHistoryData } = useDoormanContext()

  const currentPeriodRef = useRef(getTimestampBasedOnPeriod(period))

  const refetchQueryVariables = useCallback(() => {
    return {
      periodTimestamp: getTimestampBasedOnPeriod(period),
    }
  }, [period])

  useEffect(() => {
    currentPeriodRef.current = getTimestampBasedOnPeriod(period)
  }, [period])

  const { loading } = useQueryWithRefetch(
    SMVK_MVK_HISTORY_DATA,
    {
      onCompleted: (data) => {
        if (!data) return
        updateStakeHistoryData(data, period)
      },
      variables: {
        periodTimestamp: currentPeriodRef.current,
      },
      onError: (error) => handleSubError(error, MVK_SMVK_HISTORY_SUB),
    },
    { refetchQueryVariables },
  )

  // On app init it's always null for specific perios, so isLoading === true
  const areHistoriesNullable = mvkHistoryData[period] === null || smvkHistoryData[period] === null
  // if query is in progress and state is empty - isLoading === true
  const areHistoriesEmptyWhileFetching = mvkHistoryData[period]?.length === 0 && loading

  const isLoading = areHistoriesNullable || areHistoriesEmptyWhileFetching

  return {
    isLoading, // for empty array
    mvkHistoryData: mvkHistoryData[period] ?? [],
    smvkHistoryData: smvkHistoryData[period] ?? [],
  }
}

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { usePrevious } from 'react-use'

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

  const [currentPeriod, setCurrentPeriod] = useState(() => getTimestampBasedOnPeriod(period))
  const [skip, setSkip] = useState(true)

  const refetchQueryVariables = useCallback(() => {
    return {
      periodTimestamp: getTimestampBasedOnPeriod(period),
    }
  }, [period])

  useEffect(() => {
    setCurrentPeriod(getTimestampBasedOnPeriod(period))
  }, [period])

  const { refetch } = useQueryWithRefetch(
    SMVK_MVK_HISTORY_DATA,
    {
      skip,
      onCompleted: (data) => {
        if (!data) return
        updateStakeHistoryData(data, period)
      },
      variables: {
        periodTimestamp: currentPeriod,
      },
      onError: (error) => handleSubError(error, MVK_SMVK_HISTORY_SUB),
    },
    { refetchQueryVariables },
  )

  // whe user clicks to fast on periodSwitcher - the query can be pendinf and return wrong data
  // so we manually call our query to get the correct data
  useEffect(() => {
    setSkip(false)
    refetch({ periodTimestamp: getTimestampBasedOnPeriod(period) })

    return () => {
      setSkip(true)
    }
  }, [period, refetch])

  const isLoading = mvkHistoryData[period] === null || smvkHistoryData[period] === null

  return {
    isLoading, // for empty array
    mvkHistoryData: mvkHistoryData[period] ?? [],
    smvkHistoryData: smvkHistoryData[period] ?? [],
  }
}

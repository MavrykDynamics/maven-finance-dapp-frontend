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
  const {
    activeSubs,
    updateStakeHistoryData,
    handleSubError,
    mvkHistoryData,
    smvkHistoryData,
    changeStakingSubscriptionsList,
  } = useDoormanContext()

  const currentPeriodRef = useRef(getTimestampBasedOnPeriod(period))

  const refetchQueryVariables = useCallback(() => {
    return {
      periodTimestamp: getTimestampBasedOnPeriod(period),
    }
  }, [period])

  useEffect(() => {
    currentPeriodRef.current = getTimestampBasedOnPeriod(period)
  }, [period])

  useEffect(() => {
    changeStakingSubscriptionsList({
      [MVK_SMVK_HISTORY_SUB]: true,
    })

    return () => {
      changeStakingSubscriptionsList({
        [MVK_SMVK_HISTORY_SUB]: false,
      })
    }
  }, [period])

  const { loading } = useQueryWithRefetch(
    SMVK_MVK_HISTORY_DATA,
    {
      skip: !activeSubs[MVK_SMVK_HISTORY_SUB],
      onCompleted: (data) => {
        if (!data) return
        console.log(data, 'data')
        updateStakeHistoryData(data, period)
      },
      variables: {
        periodTimestamp: currentPeriodRef.current,
      },
      onError: (error) => handleSubError(error, MVK_SMVK_HISTORY_SUB),
    },
    { refetchQueryVariables },
  )

  // On app init it's always null, so isLoading === true
  const areHistoriesNullable = mvkHistoryData === null || smvkHistoryData === null
  // if query is in progress and state is empty - isLoading === true
  const areHistoriesEmpty = mvkHistoryData === null || smvkHistoryData === null

  const isLoading = areHistoriesNullable || (loading && areHistoriesEmpty)

  return {
    isLoading,
    mvkHistoryData: mvkHistoryData[period],
    smvkHistoryData: smvkHistoryData[period],
  }
}

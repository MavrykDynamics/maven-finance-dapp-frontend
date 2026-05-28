import {useCallback, useEffect, useRef, useState} from 'react'

// types
import {ChartPeriodType} from 'types/charts.type'

// hooks
import {useQueryProvider} from 'providers/QueryProvider/query.provider'
import {useDoormanContext} from '../doorman.provider'
import {useGraphQLQuery} from 'providers/QueryProvider/useGraphQLQuery'

// consts
import {SMVN_MVN_HISTORY_DATA} from '../queries/doorman.query'
import {ONE_HOUR} from 'consts/charts.const'

// utils
import {getTimestampBasedOnPeriod} from 'utils/charts.utils'

// getTimestampBasedOnPeriod
export const useDoormanHistory = (period: ChartPeriodType = ONE_HOUR) => {
  const { updateStakeHistoryData, mvnHistoryData, smvnHistoryData, noChartData } = useDoormanContext()
  const { handleQueryError } = useQueryProvider()

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

  useGraphQLQuery(
    SMVN_MVN_HISTORY_DATA,
    {
      onCompleted: (data) => {
        if (!data) return
        updateStakeHistoryData(data, period)
      },
      variables: {
        periodTimestamp: currentPeriod,
      },
      onError: (error) => handleQueryError(error, 'SMVN_MVN_HISTORY_DATA'),
    },
    { refetchQueryVariables },
  )

  return {
    isLoading: mvnHistoryData[period] === null || smvnHistoryData[period] === null,
    noChartData,
    mvnHistoryData: mvnHistoryData[period] ?? [],
    smvnHistoryData: smvnHistoryData[period] ?? [],
  }
}

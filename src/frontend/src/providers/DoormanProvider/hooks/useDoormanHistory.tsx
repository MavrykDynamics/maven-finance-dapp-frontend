import { useCallback, useEffect, useRef, useState } from 'react'

// types
import { ChartPeriodType } from 'types/charts.type'

// providers
import { useDoormanContext } from '../doorman.provider'

// hooks
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'

// queries
import { SMVK_HISTORY_AGGREGATE_DATA, SMVK_MVK_HISTORY_DATA } from '../queries/doorman.query'

// consts
import { MVK_SMVK_HISTORY_SUB } from '../helpers/doorman.consts'
import { ALL_TIME, ONE_HOUR } from 'consts/charts.const'

// utils
import { getTimestampBasedOnPeriod } from 'utils/charts.utils'
import { Smvk_History_Data_AggregateQuery } from 'utils/__generated__/graphql'

// getTimestampBasedOnPeriod
export const useDoormanHistory = (period: ChartPeriodType = ONE_HOUR) => {
  const { updateStakeHistoryData, handleSubError, mvkHistoryData, smvkHistoryData } = useDoormanContext()

  const [currentPeriod, setCurrentPeriod] = useState(() => getTimestampBasedOnPeriod(period))
  const [aggregatorData, setAggregatorData] = useState<Smvk_History_Data_AggregateQuery | null>(null)
  const [allowHistoryQuery, setAllowHistoryQuery] = useState(false)
  const aborterRef = useRef(new AbortController())

  const refetchQueryVariables = useCallback(() => {
    return {
      periodTimestamp: getTimestampBasedOnPeriod(period),
    }
  }, [period])

  useEffect(() => {
    setCurrentPeriod(getTimestampBasedOnPeriod(period))

    // cancel queries
    // aborterRef.current.abort()
    // aborterRef.current = new AbortController()
  }, [period])

  useQueryWithRefetch(
    SMVK_HISTORY_AGGREGATE_DATA,
    {
      skip: period === ALL_TIME,
      onCompleted: (data) => {
        if (!data) return
        setAggregatorData(data)
        setAllowHistoryQuery(true)
      },
      variables: {
        periodTimestamp: currentPeriod,
      },
      fetchPolicy: 'network-only',
      context: {
        fetchOptions: {
          signal: aborterRef.current.signal,
        },
      },
      onError: (error) => handleSubError(error, MVK_SMVK_HISTORY_SUB),
    },
    { refetchQueryVariables },
  )

  useQueryWithRefetch(
    SMVK_MVK_HISTORY_DATA,
    {
      skip: !allowHistoryQuery && period !== ALL_TIME,
      onCompleted: (data) => {
        if (!data) return
        updateStakeHistoryData(aggregatorData, data, period)
        setAggregatorData(null)
        setAllowHistoryQuery(false)
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
    mvkHistoryData: mvkHistoryData[period] ?? [],
    smvkHistoryData: smvkHistoryData[period] ?? [],
  }
}

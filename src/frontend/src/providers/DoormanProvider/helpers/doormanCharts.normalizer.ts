import dayjs from 'dayjs'
import { UTCTimestamp } from 'lightweight-charts'

import { SmvkMvkHistoryDataQuery } from 'utils/__generated__/graphql'

// calc
import { calcWithoutPrecision } from 'utils/calcFunctions'
import { ChartPeriodType } from 'types/charts.type'
import { ALL_TIME } from 'consts/charts.const'
import { getTimestampBasedOnPeriod } from 'utils/charts.utils'

type HistoryItemType = {
  value: number
  time: UTCTimestamp
}

// internal helpers

function createChartHistoryItemFromInitValue(
  value: number,
  type: 'first' | 'last',
  period?: ChartPeriodType,
): HistoryItemType {
  return {
    value: parseFloat(calcWithoutPrecision(value).toFixed(2)),
    time: dayjs(
      type === 'first' && period ? getTimestampBasedOnPeriod(period) : dayjs().toISOString(),
    ).valueOf() as UTCTimestamp,
  }
}

function getAggregatorValues(
  historyAggregatorData: SmvkMvkHistoryDataQuery['smvk_history_data_aggregate'] | null | undefined,
) {
  const defaultAggregatorValues = {
    initialMvkValue: 0,
    initialSmvkValue: 0,
    count: 0,
  }

  if (!historyAggregatorData) return defaultAggregatorValues

  const { aggregate } = historyAggregatorData

  return {
    // - (aggregate?.sum?.smvk_total_supply ?? 0)
    initialMvkValue: aggregate?.sum?.mvk_total_supply ?? 0,
    initialSmvkValue: aggregate?.sum?.smvk_total_supply ?? 0,
    count: Number(aggregate?.count) ?? 0,
  }
}

// ---------------------------------------------------------------------------------------------

export function normalizeDoormanChartsData(storage: SmvkMvkHistoryDataQuery, period: ChartPeriodType) {
  const { smvk_history_data = [], smvk_history_data_aggregate } = storage

  const { initialMvkValue, initialSmvkValue, count } = getAggregatorValues(smvk_history_data_aggregate)

  if (count === 0 && smvk_history_data.length === 0) {
    return {
      mvkHistoryData: [],
      smvkHistoryData: [],
      noChartData: true,
    }
  }

  // mvk default chart points
  const MVK_PeriodStartPoint = createChartHistoryItemFromInitValue(initialMvkValue, 'first', period)
  const MVK_PeriodEndPoint = createChartHistoryItemFromInitValue(initialMvkValue, 'last')

  // sMvk default chart points
  const SMVK_PeriodStartPoint = createChartHistoryItemFromInitValue(initialSmvkValue, 'first', period)
  const SMVK_PeriodEndPoint = createChartHistoryItemFromInitValue(initialSmvkValue, 'last')

  const history = smvk_history_data.reduce<{
    mvkHistoryData: HistoryItemType[]
    smvkHistoryData: HistoryItemType[]
    noChartData: boolean
  }>(
    (acc, item) => {
      // converted values for chart data points
      const _time = dayjs(item.timestamp).valueOf() as UTCTimestamp

      const mvkValue = parseFloat(
        calcWithoutPrecision(item.mvk_total_supply + initialMvkValue - item.smvk_total_supply).toFixed(2),
      )

      const sMvkValue = parseFloat(calcWithoutPrecision(item.smvk_total_supply + initialSmvkValue).toFixed(2))

      acc.mvkHistoryData.push({
        value: mvkValue,
        time: _time,
      })

      acc.smvkHistoryData.push({
        value: sMvkValue,
        time: _time,
      })

      return acc
    },
    {
      mvkHistoryData: [],
      smvkHistoryData: [],
      noChartData: false,
    },
  )

  if (period !== ALL_TIME) {
    // to avoid duplicated timestamps for charts data
    const { mvkHistoryData, smvkHistoryData } = history
    if (
      mvkHistoryData[0]?.time !== MVK_PeriodStartPoint.time &&
      smvkHistoryData[0]?.time !== SMVK_PeriodStartPoint.time
    ) {
      // add chart start points
      history.mvkHistoryData.unshift(MVK_PeriodStartPoint)
      history.smvkHistoryData.unshift(SMVK_PeriodStartPoint)
    }

    // add endPoint only when there is no items in smvk_history_data to have 2 points
    if (smvk_history_data.length === 0) {
      // add chart end points
      history.mvkHistoryData.push(MVK_PeriodEndPoint)
      history.smvkHistoryData.push(SMVK_PeriodEndPoint)
    }
  }

  return history
}

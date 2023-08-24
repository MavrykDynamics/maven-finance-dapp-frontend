import { SmvkMvkHistoryDataQuery, Smvk_History_Data_AggregateQuery } from 'utils/__generated__/graphql'
import { UTCTimestamp } from 'lightweight-charts'

// calc
import { calcWithoutPrecision } from 'utils/calcFunctions'
import { ChartPeriodType } from 'types/charts.type'
import { ALL_TIME } from 'consts/charts.const'
import dayjs from 'dayjs'
import { getTimestampBasedOnPeriod } from 'utils/charts.utils'
import { convertFromISOStringToUTCDate } from 'utils/date'

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
    time: convertFromISOStringToUTCDate(
      type === 'first' && period ? getTimestampBasedOnPeriod(period) : dayjs().toISOString(),
    ),
  }
}

function getAggregatorValues(historyAggregatorData: Smvk_History_Data_AggregateQuery | null) {
  const defaultAggregatorValues = {
    initialMvkValue: 0,
    initialSmvkValue: 0,
    count: 0,
  }

  if (!historyAggregatorData) return defaultAggregatorValues

  const {
    smvk_history_data_aggregate: { aggregate },
  } = historyAggregatorData

  return {
    initialMvkValue: aggregate?.sum?.mvk_total_supply ?? 0,
    initialSmvkValue: aggregate?.sum?.smvk_total_supply ?? 0,
    count: Number(aggregate?.count) ?? 0,
  }
}

// ---------------------------------------------------------------------------------------------

export function normalizeDoormanChartsData(
  historyAggregatorData: Smvk_History_Data_AggregateQuery | null,
  storage: SmvkMvkHistoryDataQuery,
  period: ChartPeriodType,
) {
  const { smvk_history_data = [] } = storage

  const { initialMvkValue, initialSmvkValue, count } = getAggregatorValues(historyAggregatorData)

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
      acc.mvkHistoryData.push({
        value: parseFloat(
          calcWithoutPrecision(item.mvk_total_supply + initialMvkValue - item.smvk_total_supply).toFixed(2),
        ),
        time: new Date(item.timestamp).getTime() as UTCTimestamp,
      })

      acc.smvkHistoryData.push({
        value: parseFloat(calcWithoutPrecision(item.smvk_total_supply + initialSmvkValue).toFixed(2)),
        time: new Date(item.timestamp).getTime() as UTCTimestamp,
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
    // add chart start points
    history.mvkHistoryData.unshift(MVK_PeriodStartPoint)
    history.smvkHistoryData.unshift(SMVK_PeriodStartPoint)

    // add chart end points
    history.mvkHistoryData.push(MVK_PeriodEndPoint)
    history.smvkHistoryData.push(SMVK_PeriodEndPoint)
  }

  return history
}

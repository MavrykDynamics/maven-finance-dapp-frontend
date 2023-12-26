import dayjs from 'dayjs'
import { UTCTimestamp } from 'lightweight-charts'

import { SmvkMvkHistoryDataQuery } from 'utils/__generated__/graphql'

// calc
import { convertNumberForClient } from 'utils/calcFunctions'
import { ChartPeriodType } from 'types/charts.type'
import { ALL_TIME } from 'consts/charts.const'
import { getTimestampBasedOnPeriod } from 'utils/charts.utils'
import { MVN_DECIMALS } from 'utils/constants'

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
  const convertedValueToClient = parseFloat(
    convertNumberForClient({
      number: value,
      grade: MVN_DECIMALS,
    }).toFixed(2),
  )
  return {
    value: convertedValueToClient,
    time: dayjs(
      type === 'first' && period ? getTimestampBasedOnPeriod(period) : dayjs().toISOString(),
    ).valueOf() as UTCTimestamp,
  }
}

function getStartEndPlotsForPeriod(
  lastOperationBeforePeriod: SmvkMvkHistoryDataQuery['lastOperationBeforePeriod'],
  operationsInPeriod: SmvkMvkHistoryDataQuery['operationsInPeriod'],
  period: ChartPeriodType,
) {
  const firstPlotInPeriod = lastOperationBeforePeriod.at(0)
  // if period don't have data (at(-1) does not exists), make last plot same as first one
  const lastPlotInPeriod = operationsInPeriod.at(-1) ?? firstPlotInPeriod

  // mvk default chart points
  const MVK_PeriodStartPoint = createChartHistoryItemFromInitValue(
    Number(firstPlotInPeriod?.mvk_total_supply) - Number(firstPlotInPeriod?.smvk_total_supply),
    'first',
    period,
  )
  const MVK_PeriodEndPoint = createChartHistoryItemFromInitValue(
    Number(lastPlotInPeriod?.mvk_total_supply) - Number(lastPlotInPeriod?.smvk_total_supply),
    'last',
  )

  // sMvk default chart points
  const SMVK_PeriodStartPoint = createChartHistoryItemFromInitValue(
    Number(firstPlotInPeriod?.smvk_total_supply),
    'first',
    period,
  )
  const SMVK_PeriodEndPoint = createChartHistoryItemFromInitValue(Number(lastPlotInPeriod?.smvk_total_supply), 'last')

  return {
    SMVK_PeriodEndPoint,
    SMVK_PeriodStartPoint,
    MVK_PeriodEndPoint,
    MVK_PeriodStartPoint,
  }
}

// ---------------------------------------------------------------------------------------------

export function normalizeDoormanChartsData(storage: SmvkMvkHistoryDataQuery, period: ChartPeriodType) {
  const {
    operationsInPeriod,
    lastOperationBeforePeriod,
    amountOfOperationsBeforePeriod: amountOfOperationsBeforePeriodGQL,
  } = storage

  const hasOperationsForPeriod = operationsInPeriod.length > 0
  const amountOfOperationsBeforePeriod = amountOfOperationsBeforePeriodGQL.aggregate?.count ?? 0

  if (amountOfOperationsBeforePeriod === 0 && !hasOperationsForPeriod) {
    return {
      mvkHistoryData: [],
      smvkHistoryData: [],
      noChartData: true,
    }
  }

  const { SMVK_PeriodEndPoint, SMVK_PeriodStartPoint, MVK_PeriodEndPoint, MVK_PeriodStartPoint } =
    getStartEndPlotsForPeriod(lastOperationBeforePeriod, operationsInPeriod, period)

  const history = operationsInPeriod.reduce<{
    mvkHistoryData: HistoryItemType[]
    smvkHistoryData: HistoryItemType[]
    noChartData: boolean
  }>(
    (acc, { timestamp, mvk_total_supply, smvk_total_supply }) => {
      // converted values for chart data points
      const _time = dayjs(timestamp).valueOf() as UTCTimestamp

      const _mvkAmount = mvk_total_supply - smvk_total_supply
      const mvkValue = parseFloat(convertNumberForClient({ number: _mvkAmount, grade: MVN_DECIMALS }).toFixed(2))
      const sMvkValue = parseFloat(
        convertNumberForClient({ number: smvk_total_supply, grade: MVN_DECIMALS }).toFixed(2),
      )

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
    if (operationsInPeriod.length === 0) {
      // add chart end points
      history.mvkHistoryData.push(MVK_PeriodEndPoint)
      history.smvkHistoryData.push(SMVK_PeriodEndPoint)
    }
  }

  return history
}

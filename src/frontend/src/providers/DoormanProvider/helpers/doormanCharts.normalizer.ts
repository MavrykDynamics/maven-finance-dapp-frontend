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
      mvnHistoryData: [],
      smvnHistoryData: [],
      noChartData: true,
    }
  }

  const { SMVK_PeriodEndPoint, SMVK_PeriodStartPoint, MVK_PeriodEndPoint, MVK_PeriodStartPoint } =
    getStartEndPlotsForPeriod(lastOperationBeforePeriod, operationsInPeriod, period)

  const history = operationsInPeriod.reduce<{
    mvnHistoryData: HistoryItemType[]
    smvnHistoryData: HistoryItemType[]
    noChartData: boolean
  }>(
    (acc, { timestamp, mvk_total_supply, smvk_total_supply }) => {
      // converted values for chart data points
      const _time = dayjs(timestamp).valueOf() as UTCTimestamp

      const _mvkAmount = mvk_total_supply - smvk_total_supply
      const mvnValue = parseFloat(convertNumberForClient({ number: _mvkAmount, grade: MVN_DECIMALS }).toFixed(2))
      const sMvnValue = parseFloat(
        convertNumberForClient({ number: smvk_total_supply, grade: MVN_DECIMALS }).toFixed(2),
      )

      acc.mvnHistoryData.push({
        value: mvnValue,
        time: _time,
      })

      acc.smvnHistoryData.push({
        value: sMvnValue,
        time: _time,
      })

      return acc
    },
    {
      mvnHistoryData: [],
      smvnHistoryData: [],
      noChartData: false,
    },
  )

  if (period !== ALL_TIME) {
    // to avoid duplicated timestamps for charts data
    const { mvnHistoryData, smvnHistoryData } = history
    if (
      mvnHistoryData[0]?.time !== MVK_PeriodStartPoint.time &&
      smvnHistoryData[0]?.time !== SMVK_PeriodStartPoint.time
    ) {
      // add chart start points
      history.mvnHistoryData.unshift(MVK_PeriodStartPoint)
      history.smvnHistoryData.unshift(SMVK_PeriodStartPoint)
    }

    // add endPoint only when there is no items in smvk_history_data to have 2 points
    if (operationsInPeriod.length === 0) {
      // add chart end points
      history.mvnHistoryData.push(MVK_PeriodEndPoint)
      history.smvnHistoryData.push(SMVK_PeriodEndPoint)
    }
  }

  return history
}

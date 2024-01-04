import dayjs from 'dayjs'
import { UTCTimestamp } from 'lightweight-charts'

import { SmvnMvnHistoryDataQuery } from 'utils/__generated__/graphql'

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
  lastOperationBeforePeriod: SmvnMvnHistoryDataQuery['lastOperationBeforePeriod'],
  operationsInPeriod: SmvnMvnHistoryDataQuery['operationsInPeriod'],
  period: ChartPeriodType,
) {
  const firstPlotInPeriod = lastOperationBeforePeriod.at(0)
  // if period don't have data (at(-1) does not exists), make last plot same as first one
  const lastPlotInPeriod = operationsInPeriod.at(-1) ?? firstPlotInPeriod

  // mvn default chart points
  const MVN_PeriodStartPoint = createChartHistoryItemFromInitValue(
    Number(firstPlotInPeriod?.mvn_total_supply) - Number(firstPlotInPeriod?.smvn_total_supply),
    'first',
    period,
  )
  const MVN_PeriodEndPoint = createChartHistoryItemFromInitValue(
    Number(lastPlotInPeriod?.mvn_total_supply) - Number(lastPlotInPeriod?.smvn_total_supply),
    'last',
  )

  // sMvn default chart points
  const SMVN_PeriodStartPoint = createChartHistoryItemFromInitValue(
    Number(firstPlotInPeriod?.smvn_total_supply),
    'first',
    period,
  )
  const SMVN_PeriodEndPoint = createChartHistoryItemFromInitValue(Number(lastPlotInPeriod?.smvn_total_supply), 'last')

  return {
    SMVN_PeriodEndPoint,
    SMVN_PeriodStartPoint,
    MVN_PeriodEndPoint,
    MVN_PeriodStartPoint,
  }
}

// ---------------------------------------------------------------------------------------------

export function normalizeDoormanChartsData(storage: SmvnMvnHistoryDataQuery, period: ChartPeriodType) {
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

  const { SMVN_PeriodEndPoint, SMVN_PeriodStartPoint, MVN_PeriodEndPoint, MVN_PeriodStartPoint } =
    getStartEndPlotsForPeriod(lastOperationBeforePeriod, operationsInPeriod, period)

  const history = operationsInPeriod.reduce<{
    mvnHistoryData: HistoryItemType[]
    smvnHistoryData: HistoryItemType[]
    noChartData: boolean
  }>(
    (acc, { timestamp, mvn_total_supply, smvn_total_supply }) => {
      // converted values for chart data points
      const _time = dayjs(timestamp).valueOf() as UTCTimestamp

      const _mvnAmount = mvn_total_supply - smvn_total_supply
      const mvnValue = parseFloat(convertNumberForClient({ number: _mvnAmount, grade: MVN_DECIMALS }).toFixed(2))
      const sMvnValue = parseFloat(
        convertNumberForClient({ number: smvn_total_supply, grade: MVN_DECIMALS }).toFixed(2),
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
      mvnHistoryData[0]?.time !== MVN_PeriodStartPoint.time &&
      smvnHistoryData[0]?.time !== SMVN_PeriodStartPoint.time
    ) {
      // add chart start points
      history.mvnHistoryData.unshift(MVN_PeriodStartPoint)
      history.smvnHistoryData.unshift(SMVN_PeriodStartPoint)
    }

    // add endPoint only when there is no items in smvn_history_data to have 2 points
    if (operationsInPeriod.length === 0) {
      // add chart end points
      history.mvnHistoryData.push(MVN_PeriodEndPoint)
      history.smvnHistoryData.push(SMVN_PeriodEndPoint)
    }
  }

  return history
}

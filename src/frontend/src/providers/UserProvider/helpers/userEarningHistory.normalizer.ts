import { convertNumberForClient } from 'utils/calcFunctions'
import dayjs from 'dayjs'
import { SingleValueData, UTCTimestamp } from 'lightweight-charts'

// types
import { GetUserEarningHistoryDataQuery } from 'utils/__generated__/graphql'
import { MVK_DECIMALS } from 'utils/constants'
import { getDateEnd, getDateStart } from 'utils/time'

const getChartWithOperationSpliitedByDays = ({
  chartData,
  operationValue,
  operationTime,
}: {
  chartData: Array<SingleValueData>
  operationValue: number
  operationTime: UTCTimestamp
}): Array<SingleValueData> | null => {
  // find day that matches operation time
  const operationDayIdx = chartData.findIndex(({ time }) => {
    const dayStart = getDateStart(Number(time)),
      dayEnd = getDateEnd(Number(time))

    return Number(operationTime) <= dayEnd && Number(operationTime) >= dayStart
  })

  // if we have day in period, that === operation day, update values to be sum of operation value and day value
  if (operationDayIdx !== -1) {
    return chartData.reduce((acc, { value, time }, idx) => {
      acc[idx] = {
        value: Math.max(value + operationValue, 0),
        time,
      }

      return acc
    }, chartData)
  }
  return chartData.concat({ value: (chartData.at(-1)?.value ?? 0) + operationValue, time: operationTime })
}

/**
 *
 * @param indexerData user rewards (doorman, satellite farms)
 * @returns data for chart, where all rewards claiming splitted by days, and added 2 extra plots:
 * 1. to the end - current time and current rewards claimed amount
 * 2. to the start - when started claiming with 0 rewards amount
 */
export const normalizeUserEarningHistory = (indexerData: GetUserEarningHistoryDataQuery) => {
  const { stakes_history_data, farm_accounts } = indexerData.mavryk_user?.[0]

  const normalizedStakesHistoryItems = stakes_history_data.reduce<Array<{ value: number; time: string }>>(
    (acc, { timestamp, final_amount }) => {
      acc.push({
        time: timestamp,
        value: convertNumberForClient({ number: final_amount, grade: MVK_DECIMALS }),
      })
      return acc
    },
    [],
  )

  const normalizedFarmsRewardsItems = farm_accounts.reduce<Array<{ value: number; time: string }>>(
    (acc, { claimed_rewards }) => {
      acc.push({
        // TODO: @Sam-M-Israel add time for claimed farm rewards here
        time: dayjs().toISOString(),
        value: convertNumberForClient({ number: claimed_rewards, grade: MVK_DECIMALS }),
      })
      return acc
    },
    [],
  )

  const earningHistorySplittedByDays = [...normalizedFarmsRewardsItems, ...normalizedStakesHistoryItems].reduce<
    Array<SingleValueData>
  >((acc, { value, time }) => {
    return (
      getChartWithOperationSpliitedByDays({
        chartData: acc,
        operationTime: dayjs(time).valueOf() as UTCTimestamp,
        operationValue: value,
      }) ?? acc
    )
  }, [])

  return [
    {
      value: 0,
      time: dayjs(
        getDateStart(Number(earningHistorySplittedByDays.at(0)?.time ?? dayjs().valueOf())),
      ).valueOf() as UTCTimestamp,
    },
    ...earningHistorySplittedByDays,
    {
      value: earningHistorySplittedByDays.at(-1)?.value ?? 0,
      time: dayjs().valueOf() as UTCTimestamp,
    },
  ]
}

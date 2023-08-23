import dayjs from 'dayjs'
import { ALL_TIME, ONE_HOUR, ONE_MONTH, ONE_WEEK, TWENTY_FOUR_HOURS, chartsPeriodArr } from 'consts/charts.const'
import { ValidationError } from 'errors/error'
import { ChartPeriodType } from 'types/charts.type'

/**
 *
 * @param period timestamp (see ChartPeriodType type)
 * @returns time difference from Date.now for the passed period of time
 */
export function getTimestampBasedOnPeriod(period: ChartPeriodType) {
  const now = dayjs()

  switch (period) {
    case ONE_HOUR:
      return now.subtract(1, 'hour').toISOString()
    case TWENTY_FOUR_HOURS:
      return now.subtract(24, 'hour').toISOString()
    case ONE_WEEK:
      return now.subtract(1, 'week').toISOString()
    case ONE_MONTH:
      return now.subtract(1, 'month').toISOString()
    case ALL_TIME:
      return dayjs('1960-01-01').toISOString()
    default:
      throw new ValidationError(
        `Incorrect period for timestamp. Use the following one: ${chartsPeriodArr.join(' | ')}`,
        { code: 400 },
      )
  }
}

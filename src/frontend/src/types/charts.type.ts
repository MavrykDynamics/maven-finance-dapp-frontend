import { ALL_TIME, ONE_HOUR, ONE_MONTH, ONE_WEEK, TWENTY_FOUR_HOURS } from 'consts/charts.const'

export type ChartPeriodType =
  | typeof ONE_HOUR
  | typeof TWENTY_FOUR_HOURS
  | typeof ONE_WEEK
  | typeof ONE_MONTH
  | typeof ALL_TIME

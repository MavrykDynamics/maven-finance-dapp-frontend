import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import { ONE_DAY_IN_MS } from 'providers/LoansProvider/helpers/loans.const'

dayjs.extend(advancedFormat)

export function toHHMMSS(sec: number): string {
  let hours = Math.floor(sec / 3600)
  let minutes = Math.floor((sec - hours * 3600) / 60)
  let seconds = sec - hours * 3600 - minutes * 60

  return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

/**
 * @param date timestamp of the day
 * @returns timestamp for the start of the day, if we passed 2023-06-19 18:05:23 it will retrun timestamp for 2023-06-19 00:00:00
 */
export const getDateStart = (date: string | number): number =>
  dayjs(date).hour(0).minute(0).second(0).millisecond(0).valueOf()

/**
 * @param date timestamp of the day
 * @returns timestamp for the end of the day, if we passed 2023-06-19 18:05:23 it will retrun timestamp for 2023-06-19 23:59:59
 */
export const getDateEnd = (date: string | number): number =>
  dayjs(date).hour(23).minute(59).second(59).millisecond(999).valueOf()

/**
 * @param time timestamp of the day
 * @param period period we want to check whether time is in
 * @returns boolean value whether time in passed period
 */
export const checkWhetherTimeIsLastNdays = (time: number | string, period: number) =>
  dayjs().diff(time) <= ONE_DAY_IN_MS * (period - 1)

type TimeFormatTypes =
  | 'MMM DD, HH:mm:ss'
  | 'MMM Do, YYYY, HH:mm:ss UTC'
  | 'MMM Do, YYYY, HH:mm:ss'
  | 'DD MMM YYYY / HH:mm'
  | 'DD MMM YYYY, HH:mm UTC'
  | 'MMMM DD HH:mm Z'
  | 'MMM DD, YYYY'
  | 'YYYY-MM-DD'
  | 'HH:mm'
  | 'MMM DD, HH:mm'
  | 'MMM DD, HH:mm Z'
  | 'MMMM Do HH:mm Z'
  | 'MMM Do, YYYY'
  | 'MMM DD'

export const parseDate = ({ time, timeFormat }: { time?: string | number | null; timeFormat: TimeFormatTypes }) => {
  if (!time) return null

  return dayjs(time).format(timeFormat)
}

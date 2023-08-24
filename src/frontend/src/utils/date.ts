import { UTCTimestamp } from 'lightweight-charts'

export function isIsoDate(str: string) {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false
  const d = new Date(str)
  return d instanceof Date && !isNaN(d.getTime()) && d.toISOString() === str // valid date
}

export function convertFromISOStringToUTCDate(date: string): UTCTimestamp {
  if (!isIsoDate(date)) throw new Error('Invalid ISO string for date')
  return new Date(date).getTime() as UTCTimestamp
}

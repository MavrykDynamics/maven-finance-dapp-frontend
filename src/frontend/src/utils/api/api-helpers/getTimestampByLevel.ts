import { z } from 'zod'

export const getTimestampByLevelSchema = z.string()

export type TimestampByLevelResponceType = z.infer<typeof getTimestampByLevelSchema>

export const getTimestampByLevelUrl = (level: number) =>
  `${process.env.REACT_APP_TZKT_API}/v1/blocks/${level}/timestamp`

export const getTimestampByLevelHeaders = {
  'Content-type': 'application/json',
  Accept: 'application/json',
}

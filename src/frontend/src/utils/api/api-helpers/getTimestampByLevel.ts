import { z } from 'zod'

export const getTimestampByLevelSchema = z.string()

export type TimestampByLevelResponceType = z.infer<typeof getTimestampByLevelSchema>

export const getTimestampByLevelUrl = (level: number) => `https://api.ghostnet.tzkt.io/v1/blocks/${level}/timestamp`

export const getTimestampByLevelHeaders = {
  'Content-type': 'application/json',
  Accept: 'application/json',
}

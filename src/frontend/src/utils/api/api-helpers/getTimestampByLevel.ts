import { z } from 'zod'

export const getTimestampByLevelSchema = z.string()

export const getTimestampByLevelUrl = (level: number) =>
  `https://apiWithAbort.ghostnet.tzkt.io/v1/blocks/${level}/timestamp`

export const getTimestampByLevelHeaders = {
  'Content-type': 'application/json',
  Accept: 'application/json',
}

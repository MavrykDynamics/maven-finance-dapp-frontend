import { z } from 'zod'
import { APIReturnType, api } from './api'

const getTimestampByLevelSchema = z.string()

const getTimestampByLevel = (level: number): APIReturnType<string> => {
  const { abort, fetch } = api(
    `https://api.ghostnet.tzkt.io/v1/blocks/${level}/timestamp`,
    {
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
      },
    },
    getTimestampByLevelSchema,
  )

  return {
    abort,
    fetch,
  }
}

export default getTimestampByLevel

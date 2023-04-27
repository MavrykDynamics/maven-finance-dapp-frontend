import { z, ZodSchema, objectOutputType, ZodNumber, ZodString, ZodType, ZodTypeAny } from 'zod'

export type APIReturnType<T> = objectOutputType<{ code: ZodNumber; status: ZodString; data: ZodType<T> }, ZodTypeAny>

export type Options = {
  method: 'POST' | 'PUT' | 'GET' | 'DELETE' | 'PATCH'
  body?: BodyInit | null
  signal?: AbortSignal
}

export const api = async <T>(
  url: string,
  options: Options = { method: 'GET' },
  schema: ZodSchema<T> = z.any(),
): Promise<APIReturnType<T>> => {
  try {
    const response = await fetch(url, options)
    const data = await response.json()
    const parsedData = schema.parse(data)

    return { code: response.status, status: response.statusText, data: parsedData }
  } catch (e) {
    throw e
  }
}

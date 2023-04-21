import { z, ZodSchema, objectOutputType, ZodNumber, ZodString, ZodType, ZodTypeAny } from 'zod'

export type APIReturnType<T> = objectOutputType<{ code: ZodNumber; status: ZodString; data: ZodType<T> }, ZodTypeAny>

export type Options = {
  method: 'POST' | 'PUT' | 'GET' | 'DELETE'
  body?: BodyInit | null
  signal?: AbortSignal
}

export const typedFetch = async <T>(
  url: string,
  options?: Options | null,
  schema: ZodSchema<T> = z.any(),
): Promise<T> => {
  try {
    const method = options?.method || 'GET'

    const response = await fetch(url, { method, ...options })
    const data = schema.parse(await response.json())
    return data
  } catch (e) {
    throw e
  }
}

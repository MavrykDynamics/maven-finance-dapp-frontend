import { z, ZodSchema, objectOutputType, ZodNumber, ZodType, ZodTypeAny } from 'zod'

export type APIReturnType<T> = objectOutputType<
  { code: ZodNumber; status: ZodType<'ok' | 'error'>; data: ZodType<T> },
  ZodTypeAny
>

export const api = async <T>(
  url: string,
  options?: RequestInit | null,
  schema?: ZodSchema<T> | null,
): Promise<APIReturnType<T>> => {
  try {
    const method = options?.method || 'GET'
    const _schema = schema ?? z.any()

    const response = await fetch(url, { method, ...options })
    const data = await response.json()
    const parsedData = _schema.parse(data)

    return { code: response.status, status: response.ok ? 'ok' : 'error', data: parsedData }
  } catch (e) {
    throw e
  }
}

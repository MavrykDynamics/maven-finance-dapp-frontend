import { z, ZodSchema, objectOutputType, ZodNumber, ZodType, ZodTypeAny } from 'zod'

type APIFetchReturnType<T> = objectOutputType<
  { code: ZodNumber; status: ZodType<'ok' | 'error'>; data: ZodType<T> },
  ZodTypeAny
>

export type APIReturnType<T> = {
  abort: () => void
  fetch: () => Promise<APIFetchReturnType<T>>
}

export const api = <T>(url: string, options?: RequestInit | null, schema?: ZodSchema<T> | null): APIReturnType<T> => {
  const controller = new AbortController()
  const signal = controller.signal

  return {
    abort: () => controller.abort(),
    fetch: async () => {
      try {
        const method = options?.method || 'GET'
        const _schema = schema ?? z.any()

        const response = await fetch(url, { method, signal, ...options })
        const data = await response.json()
        const parsedData = _schema.parse(data)

        return { code: response.status, status: response.ok ? 'ok' : 'error', data: parsedData }
      } catch (e) {
        throw e
      }
    },
  }
}

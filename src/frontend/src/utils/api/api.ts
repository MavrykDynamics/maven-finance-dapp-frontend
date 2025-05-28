/* eslint-disable no-useless-catch */
import { z, ZodSchema, objectOutputType, ZodNumber, ZodType, ZodTypeAny } from 'zod'

type APIFetchReturnType<T> = objectOutputType<
  { code: ZodNumber; status: ZodType<'ok' | 'error'>; data: ZodType<T> },
  ZodTypeAny
>

export const api = async <T>(
  url: string,
  options: RequestInit & { params?: Record<string, any> | null } = {
    method: 'GET',
    params: null,
  },
  schema: ZodSchema<T> = z.any(),
): Promise<APIFetchReturnType<T>> => {
  try {
    const method = options?.method || 'GET'

    const _url = options.params ? url.concat(`?${new URLSearchParams({ ...options.params })}`) : url

    delete options.params
    delete options.method

    const response = await fetch(_url, {
      method,
      ...options,
    })

    const data = await response.json()

    if (!response.ok) throw new Error(data?.message || data?.errors?.value || 'Bad request error')

    const parsedData = schema.parse(data)

    return {
      code: response.status,
      status: response.ok ? 'ok' : 'error',
      data: parsedData,
    }
  } catch (e) {
    throw e
  }
}

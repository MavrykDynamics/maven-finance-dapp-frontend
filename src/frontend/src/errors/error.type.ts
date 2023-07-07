import type { ApiError, FatalError, ValidationError } from './error'
import { ERROR_TYPE_FATAL, ERROR_TYPE_ROUTER } from './error.const'

export type InputPayload = {
  field?: string
  scope?: string
  code?: number
}

export type Payload = {
  code?: number
  data?: unknown
  scope?: string
}

export type ErrorType =
  | (Error & {
      payload?: Payload
    })
  | FatalError
  | ValidationError
  | ApiError

export type InternalErrorType = typeof ERROR_TYPE_ROUTER | typeof ERROR_TYPE_FATAL

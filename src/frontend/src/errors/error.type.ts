import type { ApiError, FatalError, PermissionError, ValidationError } from './error'

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
  | PermissionError
  | ApiError

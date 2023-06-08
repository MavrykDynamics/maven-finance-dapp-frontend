import type { ApiError, FatalError, ValidationError, TezosOperationError } from './error'

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

// tezos contracts

export type TezosContractErrorPayloadErrorItem = {
  kind: string
  id: string
  contract_handle?: string
  contract_code?: string
  location?: number
  with?: {
    [key: string]: string
  }
}
export type TezosContractErrorPayload = {
  errors?: TezosContractErrorPayloadErrorItem[]
  errorDetails?: string
  id: string
  kind: string
  name: string
  message: string
  scope?: string
}

export type ErrorType =
  | (Error & {
      payload?: Payload
    })
  | FatalError
  | ValidationError
  | ApiError
  | TezosOperationError

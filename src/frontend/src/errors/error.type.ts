import type { ApiError, FatalError, ValidationError, TezosOperationError } from './error'
import { z } from 'zod'
import { tezosContractErrorPayload, tezosContractErrorPayloadErrorItemSchema } from './error.schema'

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
export type TezosContractErrorPayloadErrorItem = z.infer<typeof tezosContractErrorPayloadErrorItemSchema>
export type TezosContractErrorPayload = z.infer<typeof tezosContractErrorPayload>

export type ErrorType =
  | (Error & {
      payload?: Payload
    })
  | FatalError
  | ValidationError
  | ApiError
  | TezosOperationError

import type { ApiError, FatalError, ValidationError, TezosOperationError } from './error'
import { z } from 'zod'
import { tezosContractErrorPayload, tezosContractErrorPayloadErrorItemSchema } from './error.schema'
import { WALLTET_ERROR_FIELD } from './consts/error.const'

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

export type TezosWalletErrorPayload = {
  message: string
  description: string
}

export type EstimatedOperation = {
  gasLimit: number
  minimalFeeMutez: number
  storageLimit: number
  suggestedFeeMutez: number
  totalCost: number
  usingBaseFeeMutez: number
  error?: TezosWalletErrorPayload
}

export type EstimatedBatchCall = {
  batchOperations?: EstimatedOperation[]
  totalGasLimit: number
  totalCost: number
  totalMinimalFeeMutez: number
  totalSuggestedFeeMutez: number
  error?: TezosWalletErrorPayload
}

export type SharedErrorFileds = typeof WALLTET_ERROR_FIELD
export type SharedErrors = TezosWalletErrorPayload

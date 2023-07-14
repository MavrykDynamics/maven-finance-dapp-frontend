import type { ApiError, FatalError, ValidationError, TezosOperationError } from './error'
import { ERROR_TYPE_FATAL, ERROR_TYPE_ROUTER } from './error.const'
import { z } from 'zod'
import {
  tezosErrorPayload,
  walletOparationErrorPayload,
  walletOperationErrorPayloadErrorItemSchema,
} from './error.schema'
import { WALLTET_ERROR_FIELD } from './consts/error.const'
import { WalletActionType } from 'types/actions.type'

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
export type WalletOperationErrorPayloadErrorItem = z.infer<typeof walletOperationErrorPayloadErrorItemSchema>
export type WalletOperationErrorPayload = z.infer<typeof walletOparationErrorPayload>

export type ErrorType =
  | (Error & {
      payload?: Payload
    })
  | FatalError
  | ValidationError
  | ApiError
  | TezosOperationError

export type TezosWalletErrorPayload = z.infer<typeof tezosErrorPayload>

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
export type SharedErrors = TezosWalletErrorPayload & { actionId: WalletActionType }

export type InternalErrorType = typeof ERROR_TYPE_ROUTER | typeof ERROR_TYPE_FATAL

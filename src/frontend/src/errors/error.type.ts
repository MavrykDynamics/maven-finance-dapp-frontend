import type { ApiError, FatalError, ValidationError, WalletOperationError } from './error'
import { ERROR_TYPE_FATAL, ERROR_TYPE_ROUTER } from './error.const'
import { z } from 'zod'
import {
  walletErrorPayload,
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
  | WalletOperationError

export type WalletErrorPayload = z.infer<typeof walletErrorPayload>

export type EstimatedOperation = {
  gasLimit: number
  minimalFeeMumav: number
  storageLimit: number
  suggestedFeeMumav: number
  totalCost: number
  usingBaseFeeMumav: number
  error?: WalletErrorPayload
}

export type EstimatedBatchCall = {
  batchOperations?: EstimatedOperation[]
  totalGasLimit: number
  totalCost: number
  totalMinimalFeeMutez: number
  totalSuggestedFeeMutez: number
  error?: WalletErrorPayload
}

export type SharedErrorFileds = typeof WALLTET_ERROR_FIELD
export type SharedErrors = WalletErrorPayload & { actionId: WalletActionType }

export type InternalErrorType = typeof ERROR_TYPE_ROUTER | typeof ERROR_TYPE_FATAL

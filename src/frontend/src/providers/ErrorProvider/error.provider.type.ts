import type { CustomErrors } from '../../errors/error'
import type ErrorProvider from './error.provider'
import {
  STAKING_FIELD,
  TOASTER_ERROR,
  TOASTER_HIDE,
  TOASTER_INFO,
  TOASTER_LOADING,
  TOASTER_REVEAL,
  TOASTER_SUCCESS,
  TOASTER_WARNING,
} from './consts/error.provider.const'

export type ToasterTypes =
  | typeof TOASTER_SUCCESS
  | typeof TOASTER_ERROR
  | typeof TOASTER_INFO
  | typeof TOASTER_LOADING
  | typeof TOASTER_WARNING

export type ToasterAnimationType = typeof TOASTER_REVEAL | typeof TOASTER_HIDE

export type ToasterMessage = {
  type: ToasterTypes
  title: string
  message: string
  unique: string
  hide: boolean
}

export interface ErrorTransfer {
  name: string
  message: string
  stack?: string
  payload?: {
    code?: number
    data?: unknown
  }
}

export type ContractErrorPayload = {
  message: string
  description: string
}

export type ContractErrors = {
  [STAKING_FIELD]: ContractErrorPayload | null
  //   add more here, like satellite, governance, dashboard etc
}

export type ErrorContextType = {
  bug: InstanceType<typeof ErrorProvider>['bug']
  info: InstanceType<typeof ErrorProvider>['info']
  warning: InstanceType<typeof ErrorProvider>['warning']
  fatal: InstanceType<typeof ErrorProvider>['fatal']
  success: InstanceType<typeof ErrorProvider>['success']
  loading: InstanceType<typeof ErrorProvider>['loading']
  error: CustomErrors | null
  hideToasterMessage: InstanceType<typeof ErrorProvider>['hideToasterMessage']
  deleteToasterFromArray: InstanceType<typeof ErrorProvider>['deleteToasterFromArray']
  addToasterMessage?: InstanceType<typeof ErrorProvider>['addToasterMessage']
  setError: InstanceType<typeof ErrorProvider>['setError']
  addContractError: InstanceType<typeof ErrorProvider>['addContractError']
  removeContractError: InstanceType<typeof ErrorProvider>['removeContractError']
  messages: ToasterMessage[]
  errors: ContractErrors
}

export type Props = {
  children: React.ReactNode
  error?: CustomErrors
  pageNotFound?: JSX.Element
}

export type State = {
  context: ErrorContextType
}

// estimate & bathch operations
export type EstimatedOperation = {
  gasLimit: number
  minimalFeeMutez: number
  storageLimit: number
  suggestedFeeMutez: number
  totalCost: number
  usingBaseFeeMutez: number
  error?: ContractErrorPayload
}

export type EstimatedBatchCall = {
  batchOperations?: EstimatedOperation[]
  totalGasLimit: number
  totalCost: number
  totalMinimalFeeMutez: number
  totalSuggestedFeeMutez: number
  error?: ContractErrorPayload
}

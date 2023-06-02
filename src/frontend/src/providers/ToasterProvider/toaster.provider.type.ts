import type { ExtendedErrors } from '../../errors/error'
import type ToasterProvider from './toaster.provider'
import {
  TOASTER_ERROR,
  TOASTER_HIDE,
  TOASTER_INFO,
  TOASTER_LOADING,
  TOASTER_REVEAL,
  TOASTER_SUCCESS,
  TOASTER_WARNING,
} from './toaster.provider.const'

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

export type ToasterContextType = {
  bug: InstanceType<typeof ToasterProvider>['bug']
  info: InstanceType<typeof ToasterProvider>['info']
  warning: InstanceType<typeof ToasterProvider>['warning']
  fatal: InstanceType<typeof ToasterProvider>['fatal']
  success: InstanceType<typeof ToasterProvider>['success']
  loading: InstanceType<typeof ToasterProvider>['loading']
  error: ExtendedErrors | null
  removeToasterMessage: InstanceType<typeof ToasterProvider>['removeToasterMessage']
  addToasterMessage?: InstanceType<typeof ToasterProvider>['addToasterMessage']
  setError: InstanceType<typeof ToasterProvider>['setError']
  messages: ToasterMessage[]
}

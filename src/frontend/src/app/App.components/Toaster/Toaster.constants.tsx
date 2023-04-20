export const SUCCESS = 'success'
export const ERROR = 'error'
export const INFO = 'info-reg'

// Toaster statuses
export const TOASTER_SUCCESS = 'TOASTER_SUCCESS'
export const TOASTER_ERROR = 'TOASTER_ERROR'
export const TOASTER_INFO = 'TOASTER_INFO'
export const TOASTER_LOADING = 'TOASTER_LOADING'

export type ToasterStatusType =
  | typeof TOASTER_SUCCESS
  | typeof TOASTER_ERROR
  | typeof TOASTER_INFO
  | typeof TOASTER_LOADING
  | string

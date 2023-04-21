import { dark } from 'styles'

export const SUCCESS = 'success'
export const ERROR = 'error'
export const INFO = 'info-reg'

// Toaster statuses
export const TOASTER_SUCCESS = 'success'
export const TOASTER_ERROR = 'error'
export const TOASTER_INFO = 'info-reg'
export const TOASTER_LOADING = 'TOASTER_LOADING'

export type ToasterStatusType =
  | typeof TOASTER_SUCCESS
  | typeof TOASTER_ERROR
  | typeof TOASTER_INFO
  | typeof TOASTER_LOADING
  | string

export const getColorByToasterStatus = ({
  toasterStatus,
  theme,
}: {
  toasterStatus?: ToasterStatusType
  theme: typeof dark
}): string => {
  switch (toasterStatus) {
    case TOASTER_SUCCESS:
      return theme.upColor
    case TOASTER_ERROR:
      return theme.downColor
    case TOASTER_INFO:
      return theme.infoColor
    case TOASTER_LOADING:
    default:
      return theme.primaryColor
  }
}

export const TOASTER_UPDATE_DATA_AFTER_ACTION_DATA = {
  title: 'Processing',
  message: 'Waiting for transaction confirmation...',
}

export const ACTION_START_MESSAGE_TEXT = 'Please wait 30s'
export const ACTION_COMPLETION_MESSAGE_TEXT = 'All good :)'

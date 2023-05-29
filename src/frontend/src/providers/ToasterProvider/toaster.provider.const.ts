import { dark } from 'styles'

// Toaster statuses
export const TOASTER_SUCCESS = 'success'
export const TOASTER_ERROR = 'error'
export const TOASTER_WARNING = 'warning'
// TODO fix naming
export const TOASTER_INFO = 'info-reg'
export const TOASTER_LOADING = 'TOASTER_LOADING'

// consts
export const ANIMATION_DURATION = 200
export const TOASTS_LIMIT = 5

export type ToasterStatusType =
  | typeof TOASTER_SUCCESS
  | typeof TOASTER_ERROR
  | typeof TOASTER_INFO
  | typeof TOASTER_LOADING
  | typeof TOASTER_WARNING
  // TODO: remove after we will use statuses only with TOASTER_ prefix
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
      return theme.lPurple_dPurple_lPuprple
    // TODO ask about warning type
    case TOASTER_WARNING:
    default:
      return 'transparent'
  }
}

// COMMON TEXTS ACROSS LOADERS
export const TOASTER_UPDATE_DATA_AFTER_ACTION_DATA = {
  title: 'Processing',
  message: 'Waiting for transaction confirmation...',
}

export const ACTION_START_MESSAGE_TEXT = 'Please wait 30s'
export const ACTION_COMPLETION_MESSAGE_TEXT = 'All good :)'

// TOASTER TEXTS IDS
export const TOASTER_SUBSCRIPTION_ERROR = 'TOASTER_SUBSCRIPTION_ERROR'

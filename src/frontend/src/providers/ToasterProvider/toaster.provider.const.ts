import { dark } from 'styles'
import { ToasterTypes } from './toaster.provider.type'

// Toaster statuses
export const TOASTER_SUCCESS = 'success'
export const TOASTER_ERROR = 'error'
export const TOASTER_WARNING = 'warning'
export const TOASTER_INFO = 'info'
export const TOASTER_LOADING = 'loading'

// icon helper
export const TOAST_ICON_MAPPER = {
  [TOASTER_SUCCESS]: TOASTER_SUCCESS,
  [TOASTER_ERROR]: TOASTER_ERROR,
  [TOASTER_WARNING]: 'error-triangle',
  [TOASTER_INFO]: 'info-reg',
  [TOASTER_LOADING]: TOASTER_LOADING,
}

// consts
export const TOAST_TIME_TO_LIVE = 4600
export const ANIMATION_DURATION = 400
export const TOASTS_LIMIT = 5

export const getColorByToasterStatus = ({
  toasterStatus,
  theme,
}: {
  toasterStatus?: ToasterTypes
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
    case TOASTER_WARNING:
      return theme.warningColor
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

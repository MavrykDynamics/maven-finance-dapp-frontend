import { AppDispatch } from 'app/App.controller'
import { toggleActionFullScreenLoader, toggleActionCompletion } from '../../Loader/Loader.action'
import { hideToaster, showToaster } from '../Toaster.actions'
import {
  TOASTER_ERROR,
  TOASTER_INFO,
  TOASTER_LOADING,
  TOASTER_SUBSCRIPTION_ERROR,
  TOASTER_SUCCESS,
  TOASTER_UPDATE_DATA_AFTER_ACTION_DATA,
} from '../Toaster.constants'
import { TOASTER_ACTIONS_TEXTS } from '../texts/toasterActions.texts'
import { TOASTER_TEXTS } from '../texts/toaster.texts'

export const actionStartToaster = (actionName: keyof typeof TOASTER_ACTIONS_TEXTS) => (dispatch: AppDispatch) => {
  dispatch(toggleActionFullScreenLoader(true))
  dispatch(toggleActionCompletion(true))
  dispatch(
    showToaster(
      TOASTER_INFO,
      TOASTER_ACTIONS_TEXTS[actionName]['start']['title'],
      TOASTER_ACTIONS_TEXTS[actionName]['start']['message'],
    ),
  )

  // show toaster loader after 5000ms after operation started
  const loadingTimeoutId = setTimeout(async () => {
    dispatch(toggleActionFullScreenLoader(false))
    dispatch(
      showToaster(
        TOASTER_LOADING,
        TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
        TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
      ),
    )
    clearTimeout(loadingTimeoutId)
  }, 5000)
}

export const actionEndToaster = (actionName: keyof typeof TOASTER_ACTIONS_TEXTS) => (dispatch: AppDispatch) => {
  dispatch(hideToaster())
  dispatch(
    showToaster(
      TOASTER_SUCCESS,
      TOASTER_ACTIONS_TEXTS[actionName]['end']['title'],
      TOASTER_ACTIONS_TEXTS[actionName]['end']['message'],
    ),
  )
  dispatch(toggleActionCompletion(false))
}

export const subsciptionErrorToaster = () => (dispatch: AppDispatch) => {
  dispatch(hideToaster())
  dispatch(
    showToaster(
      TOASTER_ERROR,
      TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'],
      TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'],
    ),
  )
  dispatch(toggleActionCompletion(false))
}

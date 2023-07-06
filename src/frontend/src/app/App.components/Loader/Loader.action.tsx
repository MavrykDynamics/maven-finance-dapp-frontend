import { AppDispatch } from 'app/App.controller'

export const TOGGLE_ACTION_FULL_SCREEN_LOADER = 'TOGGLE_ACTION_FULL_SCREEN_LOADER'
export const toggleActionFullScreenLoader = (showLoader: boolean) => (dispatch: AppDispatch) => {
  dispatch({
    type: TOGGLE_ACTION_FULL_SCREEN_LOADER,
    showLoader,
  })
}

export const TOGGLE_ACTION_COMPLETION = 'TOGGLE_ACTION_COMPLETION'
export const toggleActionCompletion = (showLoader: boolean) => (dispatch: AppDispatch) => {
  dispatch({
    type: TOGGLE_ACTION_COMPLETION,
    showLoader,
  })
}

export const TOGGLE_WERT_LOADER = 'TOGGLE_WERT_LOADER'
export const toggleWertLoader = (isWertLoading: boolean) => (dispatch: AppDispatch) => {
  dispatch({
    type: TOGGLE_WERT_LOADER,
    isWertLoading,
  })
}

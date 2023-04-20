import { AppDispatch } from 'app/App.controller'
import { ROCKET_LOADER, WERT_IO_LOADER } from 'utils/constants'

export const TOGGLE_ACTION_FULL_SCREEN_LOADER = 'TOGGLE_ACTION_FULL_SCREEN_LOADER'
export const toggleActionFullScreenLoader = (showLoader: boolean) => (dispatch: AppDispatch) => {
  dispatch({
    type: TOGGLE_ACTION_FULL_SCREEN_LOADER,
    showLoader,
  })
}

export const TOGGLE_ACTION_TOASTER_LOADER = 'TOGGLE_ACTION_LOADER'
export const toggleActionToasterLoader = (showLoader: boolean) => (dispatch: AppDispatch) => {
  dispatch({
    type: TOGGLE_ACTION_TOASTER_LOADER,
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

export const TOGGLE_INITIAL_DATA_LOADING = 'TOGGLE_INITIAL_DATA_LOADING'
export const toggleInitialDataLoading = (isInitialDataLoading: boolean) => (dispatch: AppDispatch) => {
  dispatch({
    type: TOGGLE_INITIAL_DATA_LOADING,
    isInitialDataLoading,
  })
}

import { AppDispatch } from 'app/App.controller'
import { ROCKET_LOADER, WERT_IO_LOADER } from 'utils/constants'

export const TOGGLE_ACTION_LOADER = 'TOGGLE_ACTION_LOADER'
export const toggleActionLoader = (showLoader: boolean) => (dispatch: AppDispatch) => {
  dispatch({
    type: TOGGLE_ACTION_LOADER,
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

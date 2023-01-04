import { TOGGLE_WERT_LOADER } from './../app/App.components/Loader/Loader.action'
import { TOGGLE_ACTION_LOADER, TOGGLE_INITIAL_DATA_LOADING } from 'app/App.components/Loader/Loader.action'

export type LoadingState = {
  isActionLoading: boolean
  isWertLoading: boolean
  isInitialDataLoading: boolean
}

const loadingInitialState: LoadingState = {
  isWertLoading: false,
  isActionLoading: false,
  isInitialDataLoading: true,
}

export function loading(
  state = loadingInitialState,
  action: { type: string; showLoader: boolean; isWertLoading: boolean; isInitialDataLoading: boolean },
): LoadingState {
  switch (action.type) {
    case TOGGLE_ACTION_LOADER:
      return {
        ...state,
        isActionLoading: action.showLoader,
      }
    case TOGGLE_WERT_LOADER:
      return {
        ...state,
        isWertLoading: action.isWertLoading,
      }
    case TOGGLE_INITIAL_DATA_LOADING:
      return {
        ...state,
        isInitialDataLoading: action.isInitialDataLoading,
      }
    default:
      return state
  }
}

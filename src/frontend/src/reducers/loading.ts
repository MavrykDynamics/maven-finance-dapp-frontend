import {
  TOGGLE_INITIAL_DATA_LOADING,
  TOGGLE_ACTION_FULL_SCREEN_LOADER,
  TOGGLE_ACTION_TOASTER_LOADER,
  TOGGLE_WERT_LOADER,
} from './../app/App.components/Loader/Loader.action'

export type LoadingState = {
  isActiveFullScreenLoader: boolean
  isActiveToasterLoader: boolean
  isWertLoading: boolean
  isInitialDataLoading: boolean
}

const loadingInitialState: LoadingState = {
  // isWertLoading – used for wert io payment system initialization
  isWertLoading: false,
  // isInitialDataLoading – user for full screen rocket loader to load initial DAPP data, by default on DAPP init true
  isInitialDataLoading: true,
  // isActiveFullScreenLoader – user for full screen rocket loader after operation confirmed
  isActiveFullScreenLoader: false,
  // isActiveToasterLoader – user for toaster loader, while data after operation is updating
  isActiveToasterLoader: false,
}

export function loading(
  state = loadingInitialState,
  action: { type: string; showLoader: boolean; isWertLoading: boolean; isInitialDataLoading: boolean },
): LoadingState {
  switch (action.type) {
    case TOGGLE_ACTION_FULL_SCREEN_LOADER:
      return {
        ...state,
        isActiveFullScreenLoader: action.showLoader,
      }
    case TOGGLE_ACTION_TOASTER_LOADER:
      return {
        ...state,
        isActiveToasterLoader: action.showLoader,
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

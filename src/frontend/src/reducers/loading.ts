import {
  TOGGLE_INITIAL_DATA_LOADING,
  TOGGLE_ACTION_FULL_SCREEN_LOADER,
  TOGGLE_ACTION_COMPLETION,
  TOGGLE_WERT_LOADER,
} from './../app/App.components/Loader/Loader.action'

export type LoadingState = {
  isActiveFullScreenLoader: boolean
  isActionActive: boolean
  isWertLoading: boolean
  isInitialDataLoading: boolean
}

const loadingInitialState: LoadingState = {
  // isWertLoading – used for wert io payment system initialization
  isWertLoading: false,
  // isInitialDataLoading – used for full screen rocket loader to load initial DAPP data, by default on DAPP init true
  isInitialDataLoading: true,
  // isActiveFullScreenLoader – used for full screen rocket loader after operation confirmed
  isActiveFullScreenLoader: false,
  // isActionActive – user to track whether action is fullfilled with data update and we can unlock buttons
  isActionActive: false,
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
    case TOGGLE_ACTION_COMPLETION:
      return {
        ...state,
        isActionActive: action.showLoader,
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

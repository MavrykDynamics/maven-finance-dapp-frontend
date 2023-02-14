import { GET_BREAK_GLASS_STORAGE, GET_CONTRACT_STATUSES } from '../pages/BreakGlass/BreakGlass.actions'
import { BreakGlassStatusStorage, BreakGlassConfig } from '../utils/TypesAndInterfaces/BreakGlass'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface BreakGlassState {
  breakGlassStatus: BreakGlassStatusStorage
  config: BreakGlassConfig & {
    isConfigLoaded: boolean
  }
  isLoaded: boolean
}

const breakGlassDefaultState: BreakGlassState = {
  breakGlassStatus: [],
  config: {
    glassBroken: false,
    whitelistDev: '',
    isConfigLoaded: false,
  },
  isLoaded: false,
}

export function breakGlass(state = breakGlassDefaultState, action: Action) {
  switch (action.type) {
    case GET_BREAK_GLASS_STORAGE:
      return {
        ...state,
        config: { ...action.config, isConfigLoaded: true },
      }
    case GET_CONTRACT_STATUSES:
      return {
        ...state,
        breakGlassStatus: action.breakGlassStatus,
        isLoaded: true,
      }
    default:
      return state
  }
}

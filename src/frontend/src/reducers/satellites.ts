import { HIDE_TOASTER, SHOW_TOASTER } from '../app/App.components/Toaster/Toaster.actions'
import { ERROR } from '../app/App.components/Toaster/Toaster.constants'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export type SatellitesState = {
  config: {}
  satelliteMapper: Record<string, any>
}

const satellitesDefaultState: SatellitesState = { config: {}, satelliteMapper: [] }

export function satellites(state = satellitesDefaultState, action: Action) {
  switch (action.type) {
    case SHOW_TOASTER:
      return {
        ...state,
        ...action,
      }
    default:
      return state
  }
}

// types
import { FarmStorage } from '../utils/TypesAndInterfaces/Farm'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

// consts
import { GET_FARM_STORAGE } from '../pages/Farms/Farms.actions'

export interface FarmState {
  farms: FarmStorage
  isLoaded: boolean
}

const farmDefaultState: FarmState = {
  farms: [],
  isLoaded: false,
}

export function farm(state = farmDefaultState, action: Action) {
  switch (action.type) {
    case GET_FARM_STORAGE:
      return {
        ...state,
        farms: action.farms,
        isLoaded: true,
      }
    default:
      return state
  }
}

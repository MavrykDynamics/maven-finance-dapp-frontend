// types
import { FarmStorage } from '../utils/TypesAndInterfaces/Farm'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

// consts
import { GET_FARM_STORAGE, SELECT_FARM_ADDRESS } from '../pages/Farms/Farms.actions'
import { HIDE_MODAL } from '../app/App.components/Modal/Modal.actions'

export interface FarmState {
  farms: FarmStorage
  isLoaded: boolean
}

export const HARVEST = 'HARVEST',
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW'

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

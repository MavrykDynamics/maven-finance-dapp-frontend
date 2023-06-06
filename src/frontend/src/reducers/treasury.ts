import { TreasuryType } from 'utils/TypesAndInterfaces/Treasury'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

import { SET_TREASURY_STORAGE } from '../pages/Treasury/Treasury.actions'

export interface TreasuryState {
  treasuryStorage: TreasuryType
  isLoaded: boolean
}

const treasuryDefaultState: TreasuryState = {
  treasuryStorage: [],
  isLoaded: false,
}

export function treasury(state = treasuryDefaultState, action: Action) {
  switch (action.type) {
    case SET_TREASURY_STORAGE:
      return {
        ...state,
        treasuryStorage: action.treasuryStorage,
        isLoaded: true,
      }
    default:
      return state
  }
}

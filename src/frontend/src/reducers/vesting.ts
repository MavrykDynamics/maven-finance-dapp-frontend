import { GET_VESTING_STORAGE } from './../pages/Treasury/Treasury.actions'
import { VestingStorage } from '../utils/TypesAndInterfaces/Vesting'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

import { normalizeVestingStorage } from '../app/App.helpers'

export type VestingState = VestingStorage & {
  isLoaded: boolean
}

const VestingDefaultState: VestingState = {
  address: '',
  totalVestedAmount: 0,
  totalClaimedAmount: 0,
  isLoaded: false,
}

export function vesting(state = VestingDefaultState, action: Action) {
  switch (action.type) {
    case GET_VESTING_STORAGE:
      return {
        ...state,
        ...action.vestingStorage,
        isLoaded: true,
      }
    default:
      return state
  }
}

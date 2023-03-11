import { GET_VESTING_STORAGE } from './../pages/Treasury/Treasury.actions'
import { VestingStorage } from '../utils/TypesAndInterfaces/Vesting'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export type VestingState = VestingStorage & {
  isLoaded: boolean
}

export type VestingRecord = {
  address: string
  totalRemainded: number
  totalAllocated: number
  rewardPerMonth: number
  cliffMonth: number
  vestingMonth: number
  nextRewardDate?: string | null
  lastClaimDate?: string | null
}

const VestingDefaultState: VestingState = {
  isLoaded: false,
  address: '',
  totalVestedAmount: 0,
  totalClaimedAmount: 0,

  vesteeIds: [],
  vesteesMapper: {},
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

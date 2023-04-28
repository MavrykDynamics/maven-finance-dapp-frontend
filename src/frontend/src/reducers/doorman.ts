import { GET_DOORMAN_STORAGE } from 'pages/Doorman/Doorman.actions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import { SmvkHistoryData } from '../utils/TypesAndInterfaces/Doorman'

export const STAKE = 'STAKE'
export const UNSTAKE = 'UNSTAKE'
export const COMPOUND = 'COMPOUND'

export interface DoormanState {
  totalStakedMvk: number
  mvkHistoryData: SmvkHistoryData['mvkHistoryData']
  smvkHistoryData: SmvkHistoryData['smvkHistoryData']
  isLoaded: boolean
  totalSupply: number
  maximumTotalSupply: number
}

const doormanDefaultState: DoormanState = {
  totalStakedMvk: 0,
  totalSupply: 0,
  maximumTotalSupply: 0,
  mvkHistoryData: [],
  smvkHistoryData: [],
  isLoaded: false,
}

export function doorman(state = doormanDefaultState, action: Action) {
  switch (action.type) {
    case GET_DOORMAN_STORAGE:
      return {
        ...state,
        totalStakedMvk: action.totalStakedMvk,
        totalSupply: action.totalSupply,
        maximumTotalSupply: action.maximumTotalSupply,
        mvkHistoryData: action.mvkHistoryData,
        smvkHistoryData: action.smvkHistoryData,
        isLoaded: true,
      }
    default:
      return state
  }
}

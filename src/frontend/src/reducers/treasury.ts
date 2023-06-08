import { TreasuryTokenBalanceMapper, TreasuryType } from 'utils/TypesAndInterfaces/Treasury'
import { SET_TREASURY_STORAGE } from '../pages/Treasury/Treasury.actions'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export interface TreasuryState {
  treasuryStorage: TreasuryType
  treasuryTokens: TreasuryTokenBalanceMapper
  treasuryFactoryAddress: string
  isLoaded: boolean
}

const treasuryDefaultState: TreasuryState = {
  treasuryStorage: [],
  treasuryTokens: {},
  treasuryFactoryAddress: '',
  isLoaded: false,
}

export function treasury(state = treasuryDefaultState, action: Action) {
  switch (action.type) {
    case SET_TREASURY_STORAGE:
      return {
        ...state,
        treasuryStorage: action.treasuryStorage,
        treasuryTokens: action.treasuryTokens,
        treasuryFactoryAddress: action.treasuryFactoryAddress,
        isLoaded: true,
      }
    default:
      return state
  }
}

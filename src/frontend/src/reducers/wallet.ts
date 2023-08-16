import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export const SET_REDUX_USER = 'SET_REDUX_USER'
export const DISCONNECT = 'DISCONNECT'

export interface WalletState {
  accountPkh?: string
}

export const walletDefaultState: WalletState = {
  accountPkh: undefined,
}

export function wallet(state = walletDefaultState, action: Action) {
  switch (action.type) {
    case SET_REDUX_USER:
      return {
        accountPkh: action.accountPkh,
      }
    case DISCONNECT:
      return {
        ...walletDefaultState,
      }
    default:
      return state
  }
}

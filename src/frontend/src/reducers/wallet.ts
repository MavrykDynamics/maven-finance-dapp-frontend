import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import type { MTokenType, UserFarmRewardsData } from 'utils/TypesAndInterfaces/User'

import { DISCONNECT } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import {
  MVK_TOKEN_SYMBOL,
  SMVK_TOKEN_ADDRESS,
  USER_TOKEN_TYPE_COLLATERAL,
  USER_TOKEN_TYPE_DEFAULT,
  USER_TOKEN_TYPE_MTOKEN,
  USER_TOKEN_TYPE_WHITELIST,
  XTZ_TOKEN_SYMBOL,
} from 'utils/constants'
import { UPDATE_USER_DATA } from './actions/user.actions'

export interface UserState {
  userMTokens: Array<MTokenType>

  satelliteMvkIsDelegatedTo: string
  isLoaded: boolean
  isSatellite: boolean
  isVestee: boolean
  isNewlyRegisteredSatellite: boolean
  govActionsCount: number

  // user rewards
  gatheredFarmRewards: number
  gatheredSatellitesRewards: number
  gatheredDoormanRewards: number
  availableDoormanRewards: number
  availableFarmRewards: Record<string, UserFarmRewardsData>
  availableSatellitesRewards: number
  availableLoansRewards: number

  userAvatars: {
    mainAvatar: string | null
    satelliteAvatar: string | null
    counsilAvatar: string | null
    breakGlassAvatar: string | null
  }

  // user's actions history
  actionsHistory: Array<{
    action: string
    amount: number
    totalAmount: number
    fee: number
    id: number
  }>
}

export interface WalletState {
  accountPkh?: string
  user: UserState
}

export const DEFAULT_USER: UserState = {
  userMTokens: [],

  satelliteMvkIsDelegatedTo: '',
  isLoaded: false,
  isSatellite: false,
  isVestee: false,
  isNewlyRegisteredSatellite: false,
  govActionsCount: 0,

  availableLoansRewards: 0,
  availableDoormanRewards: 0,
  availableSatellitesRewards: 0,
  availableFarmRewards: {},

  gatheredFarmRewards: 0,
  gatheredSatellitesRewards: 0,
  gatheredDoormanRewards: 0,

  userAvatars: {
    mainAvatar: null,
    satelliteAvatar: null,
    counsilAvatar: null,
    breakGlassAvatar: null,
  },

  actionsHistory: [],
}

export const walletDefaultState: WalletState = {
  accountPkh: undefined,
  user: DEFAULT_USER,
}

export function wallet(state = walletDefaultState, action: Action) {
  switch (action.type) {
    case UPDATE_USER_DATA:
      return {
        ...state,
        accountPkh: action.accountPkh,
        user: { ...action.userData, isLoaded: true },
      }
    case DISCONNECT:
      return {
        ...walletDefaultState,
      }
    default:
      return state
  }
}

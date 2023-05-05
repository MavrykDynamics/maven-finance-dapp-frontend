import type { M_Token_Account } from './../utils/generated/graphqlTypes'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import type { UserFarmRewardsData } from 'utils/TypesAndInterfaces/User'
import type { UserLendObjType } from 'utils/TypesAndInterfaces/Loans'

import { DISCONNECT } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { UPDATE_USER_DATA } from './actions/user.actions'

export interface UserState {
  // user balances
  userTokens: Record<
    string,
    {
      balance: number
      symbol: string
      name: string
    }
  >

  userMTokens: Array<M_Token_Account>

  satelliteMvkIsDelegatedTo: string
  isLoaded: boolean
  isSatellite: boolean
  isVestee: boolean

  // loans data
  userLoansData: {
    userLendings: Array<UserLendObjType>
    userBorrowing: Array<UserLendObjType>
    userVaultsData: Record<string, { borrowedAmount: number; collateralAmount: number }>
  }

  // user rewards
  gatheredFarmRewards: number
  gatheredSatellitesRewards: number
  gatheredDoormanRewards: number
  availableDoormanRewards: number
  availableFarmRewards: Record<string, UserFarmRewardsData>
  availableSatellitesRewards: number
  availableLoansRewards: number

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
  userTokens: {},
  userMTokens: [],

  satelliteMvkIsDelegatedTo: '',
  isLoaded: false,
  isSatellite: false,
  isVestee: false,

  userLoansData: {
    userLendings: [],
    userBorrowing: [],
    userVaultsData: {},
  },

  availableLoansRewards: 0,
  availableDoormanRewards: 0,
  availableSatellitesRewards: 0,
  availableFarmRewards: {},

  gatheredFarmRewards: 0,
  gatheredSatellitesRewards: 0,
  gatheredDoormanRewards: 0,

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

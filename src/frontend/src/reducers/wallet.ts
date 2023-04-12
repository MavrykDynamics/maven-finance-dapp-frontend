import type { M_Token_Account } from './../utils/generated/graphqlTypes'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import type {
  UserDoormanRewardsData,
  UserFarmRewardsData,
  UserSatelliteRewardsData,
} from 'utils/TypesAndInterfaces/User'
import type { UserLendObjType } from 'utils/TypesAndInterfaces/Loans'

import { DISCONNECT } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { UPDATE_USER_DATA } from './actions/user.actions'

export interface UserState {
  // user balance
  myMvkTokenBalance: number
  mySMvkTokenBalance: number
  myXTZTokenBalance: number
  mytzBTCTokenBalance: number

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
  mTokens?: Array<M_Token_Account>

  // user rewards
  userRewardsToDate: {
    farmRewards: number
    satelliteRewards: number
    doormanRewards: number
  }
  myDoormanRewardsData: UserDoormanRewardsData
  myFarmRewardsData: Record<string, UserFarmRewardsData>
  mySatelliteRewardsData: UserSatelliteRewardsData
  myLendingRewardsAmount: number

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
  myMvkTokenBalance: 0,
  mySMvkTokenBalance: 0,
  myXTZTokenBalance: 0,
  mytzBTCTokenBalance: 0,

  satelliteMvkIsDelegatedTo: '',
  isLoaded: false,
  isSatellite: false,
  isVestee: false,

  userLoansData: {
    userLendings: [],
    userBorrowing: [],
    userVaultsData: {},
  },
  myLendingRewardsAmount: 0,

  myFarmRewardsData: {},
  myDoormanRewardsData: {
    generalAccumulatedFeesPerShare: 0,
    generalUnclaimedRewards: 0,
    myAvailableDoormanRewards: 0,
    myParticipationFeesPerShare: 0,
  },
  mySatelliteRewardsData: {
    myAvailableSatelliteRewards: 0,
    paid: 0,
    participationRewardsPerShare: 0,
    satelliteAccumulatedRewardPerShare: 0,
    unpaid: 0,
  },
  userRewardsToDate: {
    farmRewards: 0,
    satelliteRewards: 0,
    doormanRewards: 0,
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

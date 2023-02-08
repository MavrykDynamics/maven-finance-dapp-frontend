import { TezosToolkit } from '@taquito/taquito'
import { BeaconWallet } from '@taquito/beacon-wallet'

import { M_Token_Account } from './../utils/generated/graphqlTypes'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import { UserDoormanRewardsData, UserFarmRewardsData, UserSatelliteRewardsData } from 'utils/TypesAndInterfaces/User'
import { UserLendObjType } from 'utils/TypesAndInterfaces/Loans'

import { CONNECT, DISCONNECT } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { preferencesDefaultState } from './preferences'
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

  // loans data
  userLoansData: {
    userLendings: Array<UserLendObjType>
    userBorrowing: Array<UserLendObjType>
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

const RpcNetwork = preferencesDefaultState.REACT_APP_RPC_PROVIDER

export interface WalletState {
  wallet?: BeaconWallet
  tezos: TezosToolkit
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

  userLoansData: {
    userLendings: [],
    userBorrowing: [],
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
  wallet: undefined,
  tezos: new TezosToolkit(RpcNetwork),
  accountPkh: undefined,
  user: DEFAULT_USER,
}

export function wallet(state = walletDefaultState, action: Action) {
  switch (action.type) {
    case CONNECT:
      return {
        ...state,
        wallet: action.wallet,
        tezos: action.tezos,
        accountPkh: action.accountPkh,
        user: { ...action.userData, isLoaded: true },
      }
    case UPDATE_USER_DATA:
      return {
        ...state,
        user: { ...action.userData, isLoaded: true },
      }
    case DISCONNECT:
      return {
        ...state,
        user: {
          ...walletDefaultState.user,
        },
        accountPkh: undefined,
      }
    default:
      return state
  }
}

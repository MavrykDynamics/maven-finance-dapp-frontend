import { M_Token_Account } from './../utils/generated/graphqlTypes'
import { CHANGE_WALLET, CONNECT, DISCONNECT } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { TezosToolkit } from '@taquito/taquito'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'
import { BeaconWallet } from '@taquito/beacon-wallet'
import { preferencesDefaultState } from './preferences'
import { UserDoormanRewardsData, UserFarmRewardsData, UserSatelliteRewardsData } from 'utils/TypesAndInterfaces/User'
import { UPDATE_USER_DATA } from 'pages/Doorman/Doorman.actions'
import { UserLendObjType } from 'utils/TypesAndInterfaces/Loans'

export interface UserState {
  myMvkTokenBalance: number
  mySMvkTokenBalance: number
  myXTZTokenBalance: number
  mytzBTCTokenBalance: number
  participationFeesPerShare: number
  satelliteMvkIsDelegatedTo: string
  isSatellite: boolean
  myDoormanRewardsData: UserDoormanRewardsData
  myFarmRewardsData: Record<string, UserFarmRewardsData>
  mySatelliteRewardsData: UserSatelliteRewardsData
  mTokens?: Array<M_Token_Account>
  userLoansData: {
    userLendings: Array<UserLendObjType>
    userBorrowing: Array<UserLendObjType>
  }
  userRewardsToDate: {
    farmRewards: number
    satelliteRewards: number
    doormanRewards: number
  }
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
  participationFeesPerShare: 0,
  satelliteMvkIsDelegatedTo: '',
  isSatellite: false,
  myDoormanRewardsData: {
    generalAccumulatedFeesPerShare: 0,
    generalUnclaimedRewards: 0,
    myAvailableDoormanRewards: 0,
    myParticipationFeesPerShare: 0,
  },
  myFarmRewardsData: {},
  mySatelliteRewardsData: {
    myAvailableSatelliteRewards: 0,
    paid: 0,
    participationRewardsPerShare: 0,
    satelliteAccumulatedRewardPerShare: 0,
    unpaid: 0,
  },
  userLoansData: {
    userLendings: [],
    userBorrowing: [],
  },
  userRewardsToDate: {
    farmRewards: 0,
    satelliteRewards: 0,
    doormanRewards: 0,
  },
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
        user: action.userData,
      }
    case CHANGE_WALLET:
      return {
        ...state,
        wallet: action.wallet,
        tezos: action.tezos,
        accountPkh: action.accountPkh,
      }
    case UPDATE_USER_DATA:
      return {
        ...state,
        user: action.userData,
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

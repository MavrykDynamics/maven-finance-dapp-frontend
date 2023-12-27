import { UserContextStateType, UserLoansData, UserRewardsType, UserTzKtTokenBalances } from '../user.provider.types'

export const DEFAULT_USER_AVATAR = '/images/default-avatar.png'

export const DEFAULT_USER_LOANS_DATA: UserLoansData = {
  userBorrowings: [],
  totalUserBorrowed: 0,
  userLendings: [],
  totalUserLended: 0,
  userVaultsData: {},
}

export const DEFAULT_USER: UserContextStateType = {
  userAddress: null,
  satelliteMvnIsDelegatedTo: null,
  userAvatars: {
    mainAvatar: DEFAULT_USER_AVATAR,
    satelliteAvatar: null,
    councilAvatar: null,
    breakGlassAvatar: null,
  },
  isNewlyRegisteredSatellite: false,
  userSatelliteName: null,
  isSatellite: false,
  isVestee: false,
  isMavenCouncil: false,
  isBreakGlassCouncil: false,
  actionsHistory: {
    paginatedList: {},
    itemsAmount: 0,
  },
  earningHistory: null,
  govActionsCount: 0,
  availableLoansRewards: 0,
  userTokensBalances: {},
  userMTokens: {},
  userLoansData: null,
  rewards: null,
}

export const DEFAULT_USER_TZKT_TOKENS: UserTzKtTokenBalances = {
  userAddress: null,
  tokens: {},
}

export const DEFAULT_USER_REWARDS: UserRewardsType = {
  gatheredDoormanRewards: 0,
  gatheredFarmRewards: 0,
  gatheredSatellitesRewards: 0,
  availableSatellitesRewards: 0,
  availableDoormanRewards: 0,
  farmAccounts: [],
  availableProposalRewards: [],
  availableFarmRewards: {},
}

// CONSTS FOR USER ACTIONS
export const CLAIM_VESTING_REWARD_ACTION = 'claimVestingReward'
export const CLAIM_ALL_REWARDS_ACTION = 'claimAllRewards'
export const GET_MVK_FROM_FAUCET_ACTION = 'faucetMVK'
export const REWARDS_COMPOUND_ACTION = 'rewardsCompound'

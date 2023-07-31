import { UserContextStateType, userTzKtTokenBalances } from '../user.provider.types'

export const DEFAULT_USER_AVATAR = '/images/default-avatar.png'

export const DEFAULT_USER: UserContextStateType = {
  userAddress: null,
  satelliteMvkIsDelegatedTo: null,
  userAvatars: {
    mainAvatar: DEFAULT_USER_AVATAR,
    satelliteAvatar: null,
    counsilAvatar: null,
    breakGlassAvatar: null,
  },
  isNewlyRegisteredSatellite: false,
  isSatellite: false,
  isVestee: false,
  actionsHistory: [],
  govActionsCount: 0,
  gatheredDoormanRewards: 0,
  gatheredFarmRewards: 0,
  gatheredSatellitesRewards: 0,
  availableLoansRewards: 0,
  availableSatellitesRewards: 0,
  availableDoormanRewards: 0,
  availableFarmRewards: {},
  userTokensBalances: {},
  userMTokens: {},
  farmAccounts: [],
  availableProposalRewards: [],
}

export const DEFAULT_USER_TZKT_TOKENS: userTzKtTokenBalances = {
  userAddress: null,
  tokens: {},
}

// CONSTS FOR USER ACTIONS
export const CLAIM_VESTING_REWARD_ACTION = 'claimVestingReward'
export const CLAIM_ALL_REWARDS_ACTION = 'clailAllRewards'
export const GET_MVK_FROM_FAUCET_ACTION = 'faucetMVK'
export const REWARDS_COMPOUND_ACTION = 'rewardsCompound'

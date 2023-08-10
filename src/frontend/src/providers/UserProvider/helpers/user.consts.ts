import { UserContextStateType, userTzKtTokenBalances } from '../user.provider.types'

export const DEFAULT_USER_AVATAR = '/images/default-avatar.png'

// TODO: extract fields with comments into separate useQuery hooks
// store in whole user context, but load in separate queries, cuz rare use cases
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
  actionsHistory: [], // user only on dashboard personal
  govActionsCount: 0,
  gatheredDoormanRewards: 0, // user only on  dashboard personal
  gatheredFarmRewards: 0, // user only on  dashboard personal
  gatheredSatellitesRewards: 0, // user only on  dashboard personal
  availableLoansRewards: 0,
  availableSatellitesRewards: 0,
  availableDoormanRewards: 0,
  availableFarmRewards: {},
  userTokensBalances: {},
  userMTokens: {},
  farmAccounts: [], // user only on farms & dashboard personal
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

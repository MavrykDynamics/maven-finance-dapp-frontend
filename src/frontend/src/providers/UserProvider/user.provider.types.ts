import { TokenAddressType, UserMTokenType } from 'providers/TokensProvider/tokens.provider.types'
import { z } from 'zod'
import { CLAIM_ALL_REWARDS_ACTION, CLAIM_VESTING_REWARD_ACTION } from './helpers/user.consts'

// useUserLoansData Types
export type UserLendBorrowItem = {
  amount: number
  id: number
  annualPecentage: number
  date: string
  operationHash: string
  tokenAddress: TokenAddressType
}

export type UserLoansDataStateType = {
  userBorrowings: Array<UserLendBorrowItem>
  totalUserBorrowed: number
  totalUserLended: number
  userLendings: Array<UserLendBorrowItem>
  userVaultsData: Record<string, { borrowedAmount: number; collateralAmount: number }>
}

// user tokens Types
export const userTzktTokenBalancesSchema = z.array(
  z.object({
    token: z.object({
      contract: z.object({
        address: z.string(),
      }),
    }),
    account: z.object({
      address: z.string(),
    }),
    balance: z.string(),
  }),
)
export type UserTzktTokensBalancesType = z.infer<typeof userTzktTokenBalancesSchema>

export const userTzktAccountSchema = z.object({
  balance: z.number(),
  address: z.string(),
})
export type UserTzktAccountType = z.infer<typeof userTzktWSAccountSchema>

export const userTzktWSAccountSchema = z.array(userTzktAccountSchema)
export type UserTzktWSAccountType = z.infer<typeof userTzktWSAccountSchema>

export interface UserFarmRewardsData {
  generalAccumulatedRewardsPerShare: number
  currentRewardPerBlock: number
  lastBlockUpdate: number
  generalTotalRewards: number
  generalPaidReward: number
  generalUnpaidReward: number
  infinite: boolean
  totalLPTokenDeposited: number
  myDepositedAmount: number
  myParticipationRewardsPerShare: number
  myAvailableFarmRewards: number
}

// Context types
export type UserContext = {
  // user's metadata
  userAddress: string | null
  satelliteMvkIsDelegatedTo: string | null
  isSatellite: boolean
  isVestee: boolean
  isNewlyRegisteredSatellite: boolean
  govActionsCount: number
  userAvatars: {
    mainAvatar: string
    satelliteAvatar: string | null
    counsilAvatar: string | null
    breakGlassAvatar: string | null
  }
  actionsHistory: Array<{
    action: string
    amount: number
    totalAmount: number
    fee: number
    id: number
  }>

  // user rewards
  gatheredFarmRewards: number
  gatheredSatellitesRewards: number
  gatheredDoormanRewards: number
  availableDoormanRewards: number
  availableSatellitesRewards: number
  availableLoansRewards: number
  availableFarmRewards: Record<string, UserFarmRewardsData>

  // user tokens
  userTokensBalances: Record<TokenAddressType, number>
  userMTokens: Record<TokenAddressType, UserMTokenType>

  isLoading: boolean

  // actions
  connect: () => void
  signOut: () => void
  changeUser: () => void
}

export type UserContextStateType = UserMetadataType &
  Pick<UserContext, 'userTokensBalances' | 'userMTokens' | 'userAddress' | 'availableLoansRewards'>

export type UserMetadataType = Pick<
  UserContext,
  | 'actionsHistory'
  | 'govActionsCount'
  | 'isNewlyRegisteredSatellite'
  | 'isSatellite'
  | 'isVestee'
  | 'userAvatars'
  | 'satelliteMvkIsDelegatedTo'
  | 'gatheredFarmRewards'
  | 'gatheredSatellitesRewards'
  | 'gatheredDoormanRewards'
  | 'availableDoormanRewards'
  | 'availableFarmRewards'
  | 'availableSatellitesRewards'
>

export type UserActionsType = typeof CLAIM_VESTING_REWARD_ACTION | typeof CLAIM_ALL_REWARDS_ACTION

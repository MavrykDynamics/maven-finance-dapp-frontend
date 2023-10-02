import { z } from 'zod'

// types
import { TokenAddressType, UserMTokenType } from 'providers/TokensProvider/tokens.provider.types'
import { GetUserRewardsDataQuery } from 'utils/__generated__/graphql'

// consts
import {
  CLAIM_ALL_REWARDS_ACTION,
  CLAIM_VESTING_REWARD_ACTION,
  GET_MVK_FROM_FAUCET_ACTION,
  REWARDS_COMPOUND_ACTION,
} from './helpers/user.consts'
import { userTzktTokenBalancesSchema, userTzktWSAccountSchema } from './helpers/user.schemes'

// utils
import { normalizeUserHistoryData } from './helpers/userData.helpers'

// User loans data types
export type UserLendBorrowItem = {
  amount: number
  id: number
  annualPecentage: number
  date: string
  operationHash: string
  tokenAddress: TokenAddressType
}

export type UserLoansData = {
  userBorrowings: Array<UserLendBorrowItem>
  totalUserBorrowed: number
  totalUserLended: number
  userLendings: Array<UserLendBorrowItem>
  userVaultsData: Record<
    string,
    { principle: number; collateralBalance: number; borrowedVaultsCollateralBalance: number; interest: number }
  >
}

// User tokens types
export type UserTzktTokensBalancesType = z.infer<typeof userTzktTokenBalancesSchema>
export type UserTzktAccountType = z.infer<typeof userTzktWSAccountSchema>
export type EmptyUserTzktAccountType = z.infer<typeof userTzktWSAccountSchema>
export type UserTzktWSAccountType = z.infer<typeof userTzktWSAccountSchema>

export type UserTzKtTokenBalances = {
  userAddress: string | null
  tokens: Record<TokenAddressType, number>
}

// Context types
export type UserContext = UserContextStateType & {
  isLoading: boolean
  isUserRestored: boolean

  // actions
  connect: () => void
  signOut: () => void
  changeUser: () => void

  setUserLoansData: (userLoansData: UserLoansData | null) => void
  setUserHistoryData: (page: number, userLoansData: UserHistoryData, itemsAmount: number) => void
  setUserRewards: (userRewards: UserRewardsType) => void
}

export type UserContextStateType = UserMetadataType & {
  userAddress: string | null

  rewards: UserRewardsType | null
  availableLoansRewards: number
  userLoansData: UserLoansData | null
  actionsHistory: { paginatedList: Record<number, UserHistoryData>; itemsAmount: number }

  userTokensBalances: Record<TokenAddressType, number>
  userMTokens: Record<TokenAddressType, UserMTokenType>
}

export type UserIndexerFarmRewardsType = GetUserRewardsDataQuery['mavryk_user'][number]['farm_accounts']

export type UserRewardsType = {
  gatheredFarmRewards: number
  gatheredSatellitesRewards: number
  gatheredDoormanRewards: number
  availableDoormanRewards: number
  availableSatellitesRewards: number
  availableProposalRewards: Array<number>
  availableFarmRewards: Record<string, number>
  farmAccounts: UserIndexerFarmRewardsType
}

export type UserMetadataType = {
  satelliteMvkIsDelegatedTo: string | null
  isSatellite: boolean
  userSatelliteName: string | null
  isVestee: boolean
  isMavrykCouncil: boolean
  isBreakGlassCouncil: boolean
  isNewlyRegisteredSatellite: boolean
  govActionsCount: number
  userAvatars: {
    mainAvatar: string
    satelliteAvatar: string | null
    counsilAvatar: string | null
    breakGlassAvatar: string | null
  }
}

export type UserHistoryData = ReturnType<typeof normalizeUserHistoryData>

export type UserActionsType =
  | typeof CLAIM_VESTING_REWARD_ACTION
  | typeof CLAIM_ALL_REWARDS_ACTION
  | typeof REWARDS_COMPOUND_ACTION
  | typeof GET_MVK_FROM_FAUCET_ACTION

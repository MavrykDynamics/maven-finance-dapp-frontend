import { TokenAddressType, UserMTokenType } from 'providers/TokensProvider/tokens.provider.types'
import { GetUserDataSubscription } from 'utils/__generated__/graphql'
import { z } from 'zod'
import {
  CLAIM_ALL_REWARDS_ACTION,
  CLAIM_VESTING_REWARD_ACTION,
  GET_MVK_FROM_FAUCET_ACTION,
  REWARDS_COMPOUND_ACTION,
} from './helpers/user.consts'

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
  userVaultsData: Record<
    string,
    { borrowedAmount: number; borrowedVaultsCollateralAmount: number; allVaultsCollateralAmount: number }
  >
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
  availableProposalRewards: Array<number>
  availableFarmRewards: Record<string, number>

  // user tokens
  userTokensBalances: Record<TokenAddressType, number>
  userMTokens: Record<TokenAddressType, UserMTokenType>

  isLoading: boolean
  isRunnedInitialConnect: boolean

  // actions
  connect: () => void
  signOut: () => void
  changeUser: () => void
}

export type UserIndexerFarmRewardsType = GetUserDataSubscription['mavryk_user'][number]['farm_accounts']

export type UserContextStateType = UserMetadataType &
  Pick<
    UserContext,
    'userTokensBalances' | 'userMTokens' | 'userAddress' | 'availableLoansRewards' | 'availableFarmRewards'
  > & {
    farmAccounts: UserIndexerFarmRewardsType
  }

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
  | 'availableSatellitesRewards'
  | 'availableProposalRewards'
> & {
  farmAccounts: UserIndexerFarmRewardsType
}

export type UserActionsType =
  | typeof CLAIM_VESTING_REWARD_ACTION
  | typeof CLAIM_ALL_REWARDS_ACTION
  | typeof REWARDS_COMPOUND_ACTION
  | typeof GET_MVK_FROM_FAUCET_ACTION

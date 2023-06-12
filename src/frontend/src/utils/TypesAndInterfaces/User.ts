import { TokenAddress } from 'providers/TokensProvider/tokens.provider.types'
import type { M_Token, Mavryk_User } from '../generated/graphqlTypes'

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

export type MTokenType = {
  lendedAmount: number
  balance: number
  tokenAddress: TokenAddress
  reward_index: number
  rewards_earned: number
  interestRateDecimals: number
}

export type MavrykUserGraphQl = Omit<Mavryk_User, '__typename'>

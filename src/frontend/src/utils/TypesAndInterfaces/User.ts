import type { Mavryk_User } from '../generated/graphqlTypes'

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

export type UserType = {
  id: string
  name: string
  descr: string
  website: string
  valueLocked: string
  creationDate: number | string
  feeds: string[]
}

export type MavrykUserGraphQl = Omit<Mavryk_User, '__typename'>

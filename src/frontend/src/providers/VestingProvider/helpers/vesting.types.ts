// type

// helpers
import { Vesting } from 'utils/__generated__/graphql'
import { normalizeVestingStorage } from './vesting.normalizer'

export type VestingRecord = {
  address: string
  totalRemainded: number
  totalAllocated: number
  rewardPerMonth: number
  cliffMonth: number
  vestingMonth: number
  nextRewardDate?: string | null
  lastClaimDate?: string | null
}

export type VestingStorage = ReturnType<typeof normalizeVestingStorage>

export type VestingGraphQL = Omit<Vesting, '__typename'>

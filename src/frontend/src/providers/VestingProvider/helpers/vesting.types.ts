import { normalizeVestingStorage } from './vesting.normalizer'

export type VestingRecord = {
  address: string
  totalRemainded: number
  totalAllocated: number
  rewardPerMonth: number
  cliffMonth: number
  vestingMonth: number
  isLocked: boolean
  cliffTimeEnd: string
  nextRewardDate?: string | null
  lastClaimDate?: string | null
}

export type VestingStorage = ReturnType<typeof normalizeVestingStorage>

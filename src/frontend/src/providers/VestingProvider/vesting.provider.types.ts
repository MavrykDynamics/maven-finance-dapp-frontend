import { VESTING_STORAGE_DATA_SUB } from './helpers/vesting.consts'
import { normalizeVestingStorage } from './helpers/vesting.normalizer'

// queries
export type VestingSubsType = typeof VESTING_STORAGE_DATA_SUB

export type VestingNormalizedData = ReturnType<typeof normalizeVestingStorage>

export type VestingContextStateType = {
  address: string
  totalVestedAmount: number
  totalClaimedAmount: number

  vesteeIds: (keyof VestingNormalizedData['vesteesMapper'])[]
  vesteesMapper: VestingNormalizedData['vesteesMapper']
}

export type NullableVestingContextStateType = DeepNullable<VestingContextStateType>

export type VestingContext = VestingContextStateType & {
  isLoading: boolean

  changeVestingSubscriptionsList: (skips: Partial<VestingSubsRecordType>) => void
}

export type VestingSubsRecordType = Record<VestingSubsType, boolean>

import {
  NullableVestingContextStateType,
  VestingContextStateType,
  VestingSubsRecordType,
} from '../vesting.provider.types'

export const VESTING_STORAGE_DATA_SUB = 'getVestingStorage'

export const DEFAULT_VESTING_SUBS: VestingSubsRecordType = {
  [VESTING_STORAGE_DATA_SUB]: false,
} as const

export const DEFAULT_VESTING_CTX: NullableVestingContextStateType = {
  address: null,
  totalVestedAmount: null,
  totalClaimedAmount: null,

  vesteesAddresses: null,
  vesteesMapper: null,
} as const

export const EMPTY_VESTING_CTX: VestingContextStateType = {
  address: '',
  totalVestedAmount: 0,
  totalClaimedAmount: 0,

  vesteesAddresses: [],
  vesteesMapper: {},
}

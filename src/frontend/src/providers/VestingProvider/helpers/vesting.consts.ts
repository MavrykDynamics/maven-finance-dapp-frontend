export const VESTING_STORAGE_DATA_SUB = 'getVestingStorage'

export const DEFAULT_VESTING_SUBS = {
  [VESTING_STORAGE_DATA_SUB]: false,
}

export const DEFAULT_VESTING_CTX = {
  address: null,
  totalVestedAmount: null,
  totalClaimedAmount: null,

  vesteeIds: null,
  vesteesMapper: null,
}
export const EMPTY_VESTING_CTX = {
  address: '',
  totalVestedAmount: 0,
  totalClaimedAmount: 0,

  vesteeIds: [],
  vesteesMapper: {},
}

import {
  NullableTreasuryContextStateType,
  TreasuryContextStateType,
  TreasurySubsRecordType,
} from '../treasury.provider.types'

export const TREASURY_STORAGE_DATA_SUB = 'treasuryStorage'

export const DEFAULT_TREASURY_SUBS: TreasurySubsRecordType = {
  [TREASURY_STORAGE_DATA_SUB]: false,
} as const

export const DEFAULT_TREASURY_CTX: NullableTreasuryContextStateType = {
  treasuryAddresses: null,
  treasuryMapper: null,
} as const

export const EMPTY_TREASURY_CTX: TreasuryContextStateType = {
  treasuryAddresses: [],
  treasuryMapper: {},
}

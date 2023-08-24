import { TREASURY_STORAGE_DATA_SUB } from './helpers/treasury.consts'
import { normalizeTreasuryStorage } from './helpers/treasury.normalizer'

// queries
export type TreasurySubsType = typeof TREASURY_STORAGE_DATA_SUB

export type TreasuryNormalizedData = ReturnType<typeof normalizeTreasuryStorage>

export type TreasuryContextStateType = {
  treasuryAddresses: (keyof TreasuryNormalizedData)[]
  treasuryMapper: TreasuryNormalizedData
}

export type NullableTreasuryContextStateType = DeepNullable<TreasuryContextStateType>

export type TreasuryContext = TreasuryContextStateType & {
  isLoading: boolean

  changeTreasurySubscriptionsList: (skips: Partial<TreasurySubsRecordType>) => void
}

export type TreasurySubsRecordType = Record<TreasurySubsType, boolean>

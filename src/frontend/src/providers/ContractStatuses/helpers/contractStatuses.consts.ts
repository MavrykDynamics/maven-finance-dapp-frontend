import { ContractStatusesContextStateType, NullableContractStatusesContextStateType } from '../contractStatuses.types'

// PROVIDER DEFAULT CONSTS
export const CONTRACT_STATUSES_CONFIG_SUB = 'CONTRACT_STATUSES_CONFIG'
export const CONTRACT_STATUSES_ALL_SUB = 'CONTRACT_STATUSES_ALL'

export const DEFAULT_CONTRACT_STATUSES_ACTIVE_SUBS = {
  [CONTRACT_STATUSES_CONFIG_SUB]: false,
  [CONTRACT_STATUSES_ALL_SUB]: false,
} as const

export const DEFAULT_CONTRACT_STATUSES_CTX: NullableContractStatusesContextStateType = {
  config: null,
  contractStatuses: null,
}
export const EMPTY_CONTRACT_STATUSES_CTX: ContractStatusesContextStateType = {
  config: {
    whitelistDevelopers: [],
    isGlassBroken: false,
    areContractMethodsPaused: false,
  },
  contractStatuses: [],
}

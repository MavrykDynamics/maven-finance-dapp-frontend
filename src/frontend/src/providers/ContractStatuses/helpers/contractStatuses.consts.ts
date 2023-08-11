import { ContractStatusesContextStateType, NullableContractStatusesContextStateType } from '../contractStatuses.types'

export const DEFAULT_CONTRACT_STATUSES_CTX: NullableContractStatusesContextStateType = {
  config: null,
}
export const EMPTY_CONTRACT_STATUSES_CTX: ContractStatusesContextStateType = {
  config: {
    whitelistDevelopers: [],
    isGlassBroken: false,
  },
}

import { ContractErrorPayload } from './contractError.type'

export const DEFAULT_TEZOS_ERROR: ContractErrorPayload = {
  message: 'Something went wrong',
  description: 'Something went wrong, you are not allowed to continue current operation',
}

// fields
export const STAKING_FIELD = 'staking'

export type ContractErrorKeys = typeof STAKING_FIELD

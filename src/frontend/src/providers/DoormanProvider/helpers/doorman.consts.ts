import { DoormanContextStateType } from '../doorman.provider.types'

// CONSTS FOR STAKE ACTIONS
export const STAKE_ACTION = 'stake'
export const UNSTAKE_ACTION = 'unstake'

// CONSTS FOR STAKING PROVIDER STATES
export const SMVK_HISTORY_SUB = 'smvkHistorySub'
export const MVK_TOTAL_SUB = 'mvkTotalSub'
export const MVK_BALANCE_SUB = 'mvkBalanceSub'

// PROVIDER DEFAULT CONSTS
export const DEFAULT_STAKING_ACTIVE_SUBS = {
  [MVK_BALANCE_SUB]: false,
  [MVK_TOTAL_SUB]: false,
  [SMVK_HISTORY_SUB]: false,
} as const

export const DEFAULT_STAKING_CTX: DeepNullable<DoormanContextStateType> = {
  totalStakedMvk: null,
  totalSupply: null,
  maximumTotalSupply: null,
  mvkHistoryData: null,
  smvkHistoryData: null,
}
export const EMPTY_DOORMAN_CTX: DeepNonNullable<DoormanContextStateType> = {
  totalStakedMvk: 0,
  totalSupply: 0,
  maximumTotalSupply: 0,
  mvkHistoryData: [],
  smvkHistoryData: [],
}

import { DoormanContextStateType, NullableDoormanContextStateType } from '../doorman.provider.types'

// CONSTS FOR STAKE ACTIONS
export const STAKE_ACTION = 'stake'
export const UNSTAKE_ACTION = 'unstake'

// CONSTS FOR STAKING PROVIDER STATES
export const MVK_SMVK_HISTORY_SUB = 'mvkSmvkHistorySub'
export const DAPP_MVK_SMVK_STATS_SUB = 'mvkSmvkStatsSub'

// PROVIDER DEFAULT CONSTS
export const DEFAULT_STAKING_ACTIVE_SUBS = {
  [DAPP_MVK_SMVK_STATS_SUB]: false,
  [MVK_SMVK_HISTORY_SUB]: false,
} as const

export const DEFAULT_STAKING_CTX: NullableDoormanContextStateType = {
  totalStakedMvk: null,
  totalSupply: null,
  maximumTotalSupply: null,
  mvkHistoryData: null,
  smvkHistoryData: null,
}
export const EMPTY_DOORMAN_CTX: DoormanContextStateType = {
  totalStakedMvk: 0,
  totalSupply: 0,
  maximumTotalSupply: 0,
  mvkHistoryData: [],
  smvkHistoryData: [],
}

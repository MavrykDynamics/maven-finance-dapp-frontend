import { DoormanContextStateType, NullableDoormanContextStateType } from '../doorman.provider.types'
import { ALL_TIME, ONE_HOUR, ONE_MONTH, ONE_WEEK, TWENTY_FOUR_HOURS } from 'consts/charts.const'

// CONSTS FOR STAKE ACTIONS
export const STAKE_ACTION = 'stake'
export const UNSTAKE_ACTION = 'unstake'

// CONSTS FOR STAKING PROVIDER STATES
export const MVK_SMVK_HISTORY_SUB = 'mvkSmvkHistorySub'
export const DAPP_MVK_SMVK_STATS_SUB = 'mvkSmvkStatsSub'

// PROVIDER DEFAULT CONSTS

export const DEFAULT_DOORMAN_HISTORY = {
  [ONE_HOUR]: null,
  [TWENTY_FOUR_HOURS]: null,
  [ONE_WEEK]: null,
  [ONE_MONTH]: null,
  [ALL_TIME]: null,
}

export const DEFAULT_STAKING_ACTIVE_SUBS = {
  [DAPP_MVK_SMVK_STATS_SUB]: false,
  [MVK_SMVK_HISTORY_SUB]: false,
} as const

export const DEFAULT_STAKING_CTX: NullableDoormanContextStateType = {
  totalStakedMvk: null,
  totalSupply: null,
  maximumTotalSupply: null,
  mvkHistoryData: DEFAULT_DOORMAN_HISTORY,
  smvkHistoryData: DEFAULT_DOORMAN_HISTORY,
  noChartData: false,
}
export const EMPTY_DOORMAN_CTX: DoormanContextStateType = {
  totalStakedMvk: 0,
  totalSupply: 0,
  maximumTotalSupply: 0,
  mvkHistoryData: DEFAULT_DOORMAN_HISTORY,
  smvkHistoryData: DEFAULT_DOORMAN_HISTORY,
  noChartData: false,
}

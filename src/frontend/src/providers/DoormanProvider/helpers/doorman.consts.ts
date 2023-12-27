import {DoormanContextStateType, NullableDoormanContextStateType} from '../doorman.provider.types'
import {ALL_TIME, ONE_HOUR, ONE_MONTH, ONE_WEEK, TWENTY_FOUR_HOURS} from 'consts/charts.const'

// CONSTS FOR STAKE ACTIONS
export const STAKE_ACTION = 'stake'
export const UNSTAKE_ACTION = 'unstake'

// CONSTS FOR STAKING PROVIDER STATES
export const DAPP_MVN_SMVN_STATS_SUB = 'mvnSmvnStatsSub'

export const DEFAULT_DOORMAN_HISTORY = {
  [ONE_HOUR]: null,
  [TWENTY_FOUR_HOURS]: null,
  [ONE_WEEK]: null,
  [ONE_MONTH]: null,
  [ALL_TIME]: null,
}

export const DEFAULT_STAKING_ACTIVE_SUBS = {
  [DAPP_MVN_SMVN_STATS_SUB]: false,
} as const

export const DEFAULT_STAKING_CTX: NullableDoormanContextStateType = {
  totalStakedMvn: null,
  totalSupply: null,
  maximumTotalSupply: null,
  mvnHistoryData: DEFAULT_DOORMAN_HISTORY,
  smvnHistoryData: DEFAULT_DOORMAN_HISTORY,
  noChartData: false,
}

export const EMPTY_DOORMAN_CTX: DoormanContextStateType = {
  totalStakedMvn: 0,
  totalSupply: 0,
  maximumTotalSupply: 0,
  mvnHistoryData: DEFAULT_DOORMAN_HISTORY,
  smvnHistoryData: DEFAULT_DOORMAN_HISTORY,
  noChartData: false,
}

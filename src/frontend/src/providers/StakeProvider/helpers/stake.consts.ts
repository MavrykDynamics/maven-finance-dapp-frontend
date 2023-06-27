import { StakeActionType, StakingSubsRecordType } from '../stake.provider.types'

// CONSTS FOR STAKE ACTIONS
export const STAKE_ACTION = 'stake'
export const UNSTAKE_ACTION = 'unstake'

// CONSTS FOR STAKING PROVIDER STATES
export const SMVK_HISTORY_SUB = 'smvkHistorySub'
export const MVK_TOTAL_SUB = 'mvkTotalSub'
export const MVK_BALANCE_SUB = 'mvkBalanceSub'

// PROVIDER DEFAULT CONSTS
export const DEFAULT_STAKING_SUBS = {
  [MVK_BALANCE_SUB]: false,
  [MVK_TOTAL_SUB]: false,
  [SMVK_HISTORY_SUB]: false,
  userBalance: false,
} as const

export const DEFAULT_STAKING_CTX = {
  totalStakedMvk: 0,
  totalSupply: 0,
  maximumTotalSupply: 0,
  mvkHistoryData: [],
  smvkHistoryData: [],
}

// PROVIDER HELPERS
export const getInitialLoadingStateForFiredAction = (actionName?: StakeActionType) => {
  switch (actionName) {
    case STAKE_ACTION:
    case UNSTAKE_ACTION:
      return {
        [MVK_BALANCE_SUB]: true,
        [MVK_TOTAL_SUB]: false,
        [SMVK_HISTORY_SUB]: true,
        userBalance: true,
      }
    default:
      return DEFAULT_STAKING_SUBS
  }
}

export const isAllSubsAfterActionCompleted = (queryLoadings: StakingSubsRecordType) => {
  return !Object.values(queryLoadings).find((loading) => loading)
}

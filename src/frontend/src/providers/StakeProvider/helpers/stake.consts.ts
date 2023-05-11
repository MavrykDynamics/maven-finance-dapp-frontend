// CONSTS FOR UPDATE STATE PARTIALLY
export const DOORMAN_HISTORY_SUB = 'history'
export const DOORMAN_STATS_SUB = 'doormanStats'
export const USER_MVK_BALANCE_SUB = 'userMVK_balances'
export type StakingSubscriptionsTypes =
  | typeof USER_MVK_BALANCE_SUB
  | typeof DOORMAN_STATS_SUB
  | typeof DOORMAN_HISTORY_SUB

// CONSTS FOR STAKE ACTIONS
export const STAKE_ACTION = 'stake'
export const UNSTAKE_ACTION = 'unstake'
export type StakingActionTypes = typeof STAKE_ACTION | typeof UNSTAKE_ACTION | ''

// CONST FOR ACTION LOADING
export const STAKE_DEFAULT_LOADINGS = {
  history: false,
  userBalance: false,
  doormanBalance: false,
  loadingStateUpdatedForAction: false,
}

export const getInitialLoadingStateForFiredAction = (actionName: StakingActionTypes) => {
  if (actionName === STAKE_ACTION || actionName === UNSTAKE_ACTION) {
    return {
      history: true,
      userBalance: true,
      doormanBalance: true,
    }
  }

  return STAKE_DEFAULT_LOADINGS
}

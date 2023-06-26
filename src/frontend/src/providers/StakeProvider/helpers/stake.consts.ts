import { StakeActionType, StakingActionData, StakingSubsLoadingsType } from '../stake.provider.types'

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

export const getInitialLoadingStateForFiredAction = (actionName?: StakeActionType) => {
  switch (actionName) {
    case STAKE_ACTION:
      return {
        addressBalance: true,
        mvkTokenTotal: false,
        stakeHistory: true,
        userBalance: true,
      }
    case UNSTAKE_ACTION:
      return {
        addressBalance: true,
        mvkTokenTotal: false,
        stakeHistory: true,
        userBalance: true,
      }
    default:
      return {
        addressBalance: false,
        mvkTokenTotal: false,
        stakeHistory: false,
        userBalance: false,
      }
  }
}

export const needOffStakeAction = (queryLoadings: StakingSubsLoadingsType, stakingActionData: StakingActionData) => {
  if (!stakingActionData.action || !stakingActionData.loadingToasterId) return false
  if (Object.values(queryLoadings).find((isLoading) => isLoading)) return false

  return true
}

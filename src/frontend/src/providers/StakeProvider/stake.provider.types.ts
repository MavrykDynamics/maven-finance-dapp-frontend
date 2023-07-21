import { normalizeDoormanChartsData } from './helpers/normalizer'

import { MVK_BALANCE_SUB, MVK_TOTAL_SUB, SMVK_HISTORY_SUB, STAKE_ACTION, UNSTAKE_ACTION } from './helpers/stake.consts'

export type SmvkHistoryData = ReturnType<typeof normalizeDoormanChartsData>
export type StakeActionType = typeof STAKE_ACTION | typeof UNSTAKE_ACTION
export type StakingSubsType = typeof SMVK_HISTORY_SUB | typeof MVK_TOTAL_SUB | typeof MVK_BALANCE_SUB

export type StakeContextStateType = {
  mvkHistoryData: SmvkHistoryData['mvkHistoryData'] | null
  smvkHistoryData: SmvkHistoryData['smvkHistoryData'] | null
  totalStakedMvk: number | null
  totalSupply: number | null
  maximumTotalSupply: number | null
}

export type StakeContext = DeepNonNullable<StakeContextStateType> & {
  isLoading: boolean

  changeStakingSubscriptionsList: (skips: Partial<StakingSubsRecordType>) => void
}

export type StakingActionData = {
  loadingToasterId: string
  action: StakeActionType
} | null

export type StakingSubsRecordType = Record<StakingSubsType, boolean>

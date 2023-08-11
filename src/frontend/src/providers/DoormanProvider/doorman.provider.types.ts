import { normalizeDoormanChartsData } from './helpers/normalizer'

import { MVK_SMVK_HISTORY_SUB, DAPP_MVK_SMVK_STATS_SUB, STAKE_ACTION, UNSTAKE_ACTION } from './helpers/doorman.consts'

export type SmvkHistoryData = ReturnType<typeof normalizeDoormanChartsData>
export type StakeActionType = typeof STAKE_ACTION | typeof UNSTAKE_ACTION
export type StakingSubsType = typeof DAPP_MVK_SMVK_STATS_SUB | typeof MVK_SMVK_HISTORY_SUB

export type DoormanContextStateType = {
  mvkHistoryData: SmvkHistoryData['mvkHistoryData']
  smvkHistoryData: SmvkHistoryData['smvkHistoryData']
  totalStakedMvk: number
  totalSupply: number
  maximumTotalSupply: number
}

export type NullableDoormanContextStateType = DeepNullable<DoormanContextStateType>

export type DoormanContext = DoormanContextStateType & {
  isLoading: boolean

  changeStakingSubscriptionsList: (skips: Partial<DoormanSubsRecordType>) => void
}

export type DoormanActionData = {
  loadingToasterId: string
  action: StakeActionType
} | null

export type DoormanSubsRecordType = Record<StakingSubsType, boolean>

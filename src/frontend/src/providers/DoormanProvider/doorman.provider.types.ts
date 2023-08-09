import { normalizeDoormanChartsData } from './helpers/normalizer'

import {
  MVK_BALANCE_SUB,
  MVK_TOTAL_SUB,
  SMVK_HISTORY_SUB,
  STAKE_ACTION,
  UNSTAKE_ACTION,
} from './helpers/doorman.consts'

export type SmvkHistoryData = ReturnType<typeof normalizeDoormanChartsData>
export type StakeActionType = typeof STAKE_ACTION | typeof UNSTAKE_ACTION
export type StakingSubsType = typeof SMVK_HISTORY_SUB | typeof MVK_TOTAL_SUB | typeof MVK_BALANCE_SUB

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

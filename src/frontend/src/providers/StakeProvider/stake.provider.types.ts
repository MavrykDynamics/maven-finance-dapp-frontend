import React from 'react'

import { normalizeDoormanChartsData } from './helpers/normalizer'

import { MVK_BALANCE_SUB, MVK_TOTAL_SUB, SMVK_HISTORY_SUB, STAKE_ACTION, UNSTAKE_ACTION } from './helpers/stake.consts'

export type SmvkHistoryData = ReturnType<typeof normalizeDoormanChartsData>
export type StakeActionType = typeof STAKE_ACTION | typeof UNSTAKE_ACTION
export type StakingSubsType = typeof SMVK_HISTORY_SUB | typeof MVK_TOTAL_SUB | typeof MVK_BALANCE_SUB
export type StakeContext = {
  // data
  mvkHistoryData: SmvkHistoryData['mvkHistoryData']
  smvkHistoryData: SmvkHistoryData['smvkHistoryData']
  totalStakedMvk: number
  totalSupply: number
  maximumTotalSupply: number

  // additional data & methods
  isLoading: boolean
  changeStakingSubscriptionsList: (skips: Partial<StakingSubsRecordType>) => void
}

export type StakeContextStateType = Pick<
  StakeContext,
  'totalStakedMvk' | 'totalSupply' | 'maximumTotalSupply' | 'mvkHistoryData' | 'smvkHistoryData'
>

export type StakingActionData = {
  loadingToasterId: string
  action: StakeActionType
} | null

export type Props = {
  children: React.ReactNode
}

export type StakingSubsRecordType = Record<StakingSubsType, boolean>

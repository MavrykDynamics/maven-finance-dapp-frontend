import { normalizeDoormanChartsData } from './helpers/normalizer'

import { MVK_SMVK_HISTORY_SUB, DAPP_MVK_SMVK_STATS_SUB, STAKE_ACTION, UNSTAKE_ACTION } from './helpers/doorman.consts'
import { SmvkMvkHistoryDataQuery } from 'utils/__generated__/graphql'
import { ApolloError } from '@apollo/client'
import { ChartPeriodType } from 'types/charts.type'
import { TupleKeyValueAny } from 'types/global'

export type SmvkHistoryData = ReturnType<typeof normalizeDoormanChartsData>
export type StakeActionType = typeof STAKE_ACTION | typeof UNSTAKE_ACTION
export type StakingSubsType = typeof DAPP_MVK_SMVK_STATS_SUB | typeof MVK_SMVK_HISTORY_SUB

// history types
export type MvkHistoryChartsType = TupleKeyValueAny<ChartPeriodType, SmvkHistoryData['mvkHistoryData']>
export type SMvkHistoryChartsType = TupleKeyValueAny<ChartPeriodType, SmvkHistoryData['smvkHistoryData']>

export type DoormanContextStateType = {
  mvkHistoryData: MvkHistoryChartsType
  smvkHistoryData: SMvkHistoryChartsType
  totalStakedMvk: number
  totalSupply: number
  maximumTotalSupply: number
}

export type NullableDoormanContextStateType = DeepNullable<DoormanContextStateType>

export type DoormanContext = DoormanContextStateType & {
  isLoading: boolean

  activeSubs: DoormanSubsRecordType
  changeStakingSubscriptionsList: (skips: Partial<DoormanSubsRecordType>) => void
  updateStakeHistoryData: (historyData: SmvkMvkHistoryDataQuery, period: ChartPeriodType) => void
  handleSubError: (error: ApolloError, subName: StakingSubsType) => void
}

export type DoormanActionData = {
  loadingToasterId: string
  action: StakeActionType
} | null

export type DoormanSubsRecordType = Record<StakingSubsType, boolean>

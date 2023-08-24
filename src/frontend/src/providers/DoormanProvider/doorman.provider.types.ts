import { normalizeDoormanChartsData } from './helpers/doormanCharts.normalizer'

import { DAPP_MVK_SMVK_STATS_SUB, STAKE_ACTION, UNSTAKE_ACTION } from './helpers/doorman.consts'
import { SmvkMvkHistoryDataQuery } from 'utils/__generated__/graphql'
import { ApolloError } from '@apollo/client'
import { ChartPeriodType } from 'types/charts.type'
import { TupleKeyValueAny } from 'types/global'

export type SmvkHistoryData = ReturnType<typeof normalizeDoormanChartsData>
export type StakeActionType = typeof STAKE_ACTION | typeof UNSTAKE_ACTION
export type StakingSubsType = typeof DAPP_MVK_SMVK_STATS_SUB

// nullable history default state types
export type NullableMvkHistoryChartsType = TupleKeyValueAny<ChartPeriodType, SmvkHistoryData['mvkHistoryData'] | null>
export type NullableSmvkHistoryChartsType = TupleKeyValueAny<ChartPeriodType, SmvkHistoryData['smvkHistoryData'] | null>

export type DoormanContextStateType = {
  mvkHistoryData: NullableMvkHistoryChartsType
  smvkHistoryData: NullableSmvkHistoryChartsType
  totalStakedMvk: number
  totalSupply: number
  maximumTotalSupply: number
}

export type NullableDoormanContextStateType = DeepNullable<
  Omit<DoormanContextStateType, 'mvkHistoryData' | 'smvkHistoryData'>
> & {
  mvkHistoryData: NullableMvkHistoryChartsType
  smvkHistoryData: NullableSmvkHistoryChartsType
}

export type DoormanContext = DoormanContextStateType & {
  isLoading: boolean

  activeSubs: DoormanSubsRecordType
  changeStakingSubscriptionsList: (skips: Partial<DoormanSubsRecordType>) => void
  updateStakeHistoryData: (historyData: SmvkMvkHistoryDataQuery, period: ChartPeriodType) => void
  handleSubError: (error: ApolloError, subName: string) => void
}

export type DoormanActionData = {
  loadingToasterId: string
  action: StakeActionType
} | null

export type DoormanSubsRecordType = Record<StakingSubsType, boolean>

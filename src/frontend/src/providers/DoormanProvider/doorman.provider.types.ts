import { normalizeDoormanChartsData } from './helpers/doormanCharts.normalizer'

import { DAPP_MVN_SMVN_STATS_SUB, STAKE_ACTION, UNSTAKE_ACTION } from './helpers/doorman.consts'
import { SmvkMvkHistoryDataQuery } from 'utils/__generated__/graphql'
import { ChartPeriodType } from 'types/charts.type'

export type SmvnHistoryData = ReturnType<typeof normalizeDoormanChartsData>
export type StakeActionType = typeof STAKE_ACTION | typeof UNSTAKE_ACTION
export type StakingSubsType = typeof DAPP_MVN_SMVN_STATS_SUB

// nullable history default state types
export type NullableMvnHistoryChartsType = TupleKeyValueAny<ChartPeriodType, SmvnHistoryData['mvnHistoryData'] | null>
export type NullableSmvnHistoryChartsType = TupleKeyValueAny<ChartPeriodType, SmvnHistoryData['smvnHistoryData'] | null>

export type DoormanContextStateType = {
  mvnHistoryData: NullableMvnHistoryChartsType
  smvnHistoryData: NullableSmvnHistoryChartsType
  noChartData: SmvnHistoryData['noChartData']
  totalStakedMvn: number
  totalSupply: number
  maximumTotalSupply: number
}

export type NullableDoormanContextStateType = DeepNullable<
  Omit<DoormanContextStateType, 'mvnHistoryData' | 'smvnHistoryData'>
> & {
  mvnHistoryData: NullableMvnHistoryChartsType
  smvnHistoryData: NullableSmvnHistoryChartsType
}

export type DoormanContext = DoormanContextStateType & {
  isLoading: boolean

  changeStakingSubscriptionsList: (skips: Partial<DoormanSubsRecordType>) => void
  updateStakeHistoryData: (historyData: SmvkMvkHistoryDataQuery, period: ChartPeriodType) => void
}

export type DoormanActionData = {
  loadingToasterId: string
  action: StakeActionType
} | null

export type DoormanSubsRecordType = Record<StakingSubsType, boolean>
